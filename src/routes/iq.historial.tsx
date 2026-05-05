import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { clasificarIQ } from "@/lib/iq-scoring";

export const Route = createFileRoute("/iq/historial")({
  head: () => ({
    meta: [{ title: "Historial de IQ — Autodidactas" }, { name: "robots", content: "noindex" }],
  }),
  component: IQHistorial,
});

interface AttemptRow {
  id: string;
  iq_score: number | null;
  percentil: number | null;
  respuestas_correctas: number;
  total_preguntas: number;
  completed_at: string | null;
  created_at: string;
}

function IQHistorial() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AttemptRow[] | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("iq_attempts")
        .select("id, iq_score, percentil, respuestas_correctas, total_preguntas, completed_at, created_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });
      setRows((data ?? []) as AttemptRow[]);
    })();
  }, [user, authLoading, navigate]);

  const stats = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const valid = rows.filter((r) => r.iq_score != null);
    if (valid.length === 0) return null;
    const scores = valid.map((r) => r.iq_score as number);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const last = scores[0];
    const prev = scores[1];
    const delta = prev != null ? last - prev : null;
    return { count: valid.length, max, min, avg, last, delta };
  }, [rows]);

  // chart points (oldest → newest, left → right)
  const chart = useMemo(() => {
    if (!rows) return null;
    const pts = rows
      .filter((r) => r.iq_score != null)
      .slice()
      .reverse()
      .map((r, i) => ({ i, score: r.iq_score as number, date: r.completed_at ?? r.created_at }));
    return pts.length > 0 ? pts : null;
  }, [rows]);

  if (rows === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b-2 border-ink">
        <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] h-14 flex items-center justify-between">
          <Link to="/iq" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-orange transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.25} /> Test de IQ
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Vol. I · Historial</span>
          <Link to="/iq/inicio" className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink hover:text-orange transition-colors">
            Nuevo intento →
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-12 lg:py-16">
        <div className="border-l-4 border-ink pl-5 mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange mb-3">Tu evolución</p>
          <h1 className="font-display leading-[0.95] tracking-[-0.02em]" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}>
            Historial de<br/><span className="italic">intentos.</span>
          </h1>
        </div>

        {rows.length === 0 ? (
          <div className="border-2 border-ink p-10 text-center shadow-[6px_6px_0_0_var(--ink)]">
            <p className="font-display text-2xl mb-3">Todavía no completaste ningún test.</p>
            <p className="text-ink/60 text-[14px] mb-6">Hacé tu primer intento y empezá a medir tu evolución.</p>
            <Link
              to="/iq/inicio"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.25em] hover:bg-orange transition-colors"
            >
              Comenzar test <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
            </Link>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 border-2 border-ink mb-10">
                <StatCell label="Último IQ" value={stats.last.toString()} accent />
                <StatCell label="Promedio" value={stats.avg.toString()} />
                <StatCell label="Máximo" value={stats.max.toString()} />
                <StatCell label="Intentos" value={stats.count.toString()} last />
              </div>
            )}

            {/* Chart */}
            {chart && chart.length > 1 && (
              <section className="border-2 border-ink mb-10">
                <div className="border-b-2 border-ink px-5 py-3 flex items-center justify-between bg-cream/40">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/70 inline-flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.25} /> Evolución del IQ
                  </p>
                  {stats?.delta != null && (
                    <span className={`font-mono text-[12px] tabular-nums ${stats.delta >= 0 ? "text-orange" : "text-ink/60"}`}>
                      {stats.delta >= 0 ? "▲" : "▼"} {Math.abs(stats.delta)} vs. anterior
                    </span>
                  )}
                </div>
                <Sparkline points={chart} />
              </section>
            )}

            {/* Lista */}
            <section className="border-2 border-ink">
              <div className="border-b-2 border-ink px-5 py-3 bg-ink text-paper">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Intentos completados</p>
              </div>
              <ul className="divide-y-2 divide-ink/15">
                {rows.map((r, i) => {
                  const cls = r.iq_score != null ? clasificarIQ(r.iq_score) : null;
                  const date = new Date(r.completed_at ?? r.created_at);
                  return (
                    <li key={r.id}>
                      <Link
                        to="/iq/resultado/$intentoId"
                        params={{ intentoId: r.id }}
                        className="grid grid-cols-12 items-center gap-4 px-5 py-5 hover:bg-cream/40 transition-colors group"
                      >
                        <span className="col-span-1 font-mono text-[11px] text-ink/40 tabular-nums">
                          {(rows.length - i).toString().padStart(2, "0")}
                        </span>
                        <span className="col-span-3 font-mono text-[12px] text-ink/70 tabular-nums">
                          {date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                        <span className="col-span-2 font-display text-3xl tabular-nums">
                          {r.iq_score ?? "—"}
                        </span>
                        <span className="col-span-3 text-[12px] font-mono uppercase tracking-wider" style={{ color: cls?.color }}>
                          {cls?.label ?? "Sin clasificar"}
                        </span>
                        <span className="col-span-2 text-[12px] font-mono text-ink/60 tabular-nums text-right">
                          {r.respuestas_correctas}/{r.total_preguntas}
                        </span>
                        <ArrowRight className="col-span-1 w-4 h-4 text-ink/30 group-hover:text-orange group-hover:translate-x-1 transition-all justify-self-end" strokeWidth={2.25} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCell({ label, value, accent, last }: { label: string; value: string; accent?: boolean; last?: boolean }) {
  return (
    <div className={`p-5 lg:p-6 ${!last ? "border-r-2 last:border-r-0 border-ink" : ""} ${accent ? "bg-ink text-paper" : ""}`}>
      <p className={`font-mono text-[10px] uppercase tracking-[0.25em] mb-2 ${accent ? "text-paper/60" : "text-ink/60"}`}>{label}</p>
      <p className="font-display text-4xl lg:text-5xl tabular-nums leading-none">{value}</p>
    </div>
  );
}

function Sparkline({ points }: { points: { i: number; score: number; date: string }[] }) {
  const W = 800;
  const H = 220;
  const PAD = 30;
  const minY = Math.min(55, Math.min(...points.map((p) => p.score)) - 5);
  const maxY = Math.max(160, Math.max(...points.map((p) => p.score)) + 5);
  const xFor = (i: number) => PAD + (i / Math.max(1, points.length - 1)) * (W - PAD * 2);
  const yFor = (s: number) => H - PAD - ((s - minY) / (maxY - minY)) * (H - PAD * 2);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.i)} ${yFor(p.score)}`).join(" ");

  return (
    <div className="p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* baseline IQ 100 */}
        <line x1={PAD} x2={W - PAD} y1={yFor(100)} y2={yFor(100)} stroke="var(--ink)" strokeOpacity="0.15" strokeDasharray="4 4" />
        <text x={PAD} y={yFor(100) - 6} className="font-mono" fontSize="10" fill="var(--ink)" fillOpacity="0.4">IQ 100 · media</text>
        {/* path */}
        <path d={d} fill="none" stroke="var(--ink)" strokeWidth="2" />
        {/* points */}
        {points.map((p) => (
          <g key={p.i}>
            <circle cx={xFor(p.i)} cy={yFor(p.score)} r="5" fill="var(--orange)" stroke="var(--ink)" strokeWidth="2" />
            <text x={xFor(p.i)} y={yFor(p.score) - 12} textAnchor="middle" fontSize="11" className="font-mono" fill="var(--ink)">{p.score}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
