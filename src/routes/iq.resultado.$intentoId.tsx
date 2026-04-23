import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Crown, Check, X, Loader2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { NeuralBackground } from "@/components/NeuralBackground";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AREA_META, clasificarIQ, type Area } from "@/lib/iq-scoring";

export const Route = createFileRoute("/iq/resultado/$intentoId")({
  head: () => ({
    meta: [
      { title: "Resultado del Test de IQ — Autodidactas" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IQResultado,
});

interface Attempt {
  id: string;
  nombre: string;
  iq_score: number | null;
  percentil: number | null;
  respuestas_correctas: number;
  total_preguntas: number;
  area_scores: Record<Area, { correctas: number; total: number; porcentaje: number }> | null;
}

function IQResultado() {
  const { intentoId } = useParams({ from: "/iq/resultado/$intentoId" });
  const { user } = useAuth();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPro, setHasPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("iq_attempts")
        .select("id, nombre, iq_score, percentil, respuestas_correctas, total_preguntas, area_scores")
        .eq("id", intentoId)
        .maybeSingle();
      if (!error && data) setAttempt(data as Attempt);
      setLoading(false);
    })();
  }, [intentoId]);

  // Detectar plan pro
  useEffect(() => {
    if (!user) {
      setHasPro(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      const plan = (data as { plan?: string } | null)?.plan;
      setHasPro(plan === "pro" || plan === "teams");
    })();
  }, [user]);

  // Mostrar paywall a los 600ms si no tiene Pro
  useEffect(() => {
    if (loading || hasPro) return;
    const t = setTimeout(() => setShowPaywall(true), 600);
    return () => clearTimeout(t);
  }, [loading, hasPro]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/50" />
      </div>
    );
  }
  if (!attempt || attempt.iq_score == null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-ink p-8 text-center">
        <h2 className="font-display text-2xl">Resultado no disponible</h2>
        <Link to="/iq" className="mt-6 px-4 py-2 bg-ink text-paper rounded-md text-sm">
          Volver
        </Link>
      </div>
    );
  }

  const { label: clasif, color: clasifColor } = clasificarIQ(attempt.iq_score);
  const blurred = !hasPro;

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <NeuralBackground />
      <Navbar />

      <main className="container mx-auto px-6 lg:px-10 max-w-[860px] py-14">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream/70 border border-border rounded-full text-[11px] font-mono uppercase tracking-wider text-ink/60">
            <Sparkles className="w-3 h-3 text-orange" strokeWidth={2.5} />
            Resultado de {attempt.nombre}
          </span>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tight mt-4">
            Tu evaluación cognitiva
          </h1>
        </div>

        {/* Bloque de resultado */}
        <div
          className={
            blurred ? "filter blur-md pointer-events-none select-none transition-all" : "transition-all"
          }
        >
          <section className="rounded-2xl border border-border bg-paper/90 backdrop-blur-sm p-8 lg:p-10 text-center shadow-paper">
            <p className="text-[12px] font-mono uppercase tracking-[0.18em] text-ink/45">
              Coeficiente intelectual
            </p>
            <div
              className="font-display font-semibold tracking-tight mt-2 leading-none"
              style={{ fontSize: "clamp(4rem, 14vw, 7rem)", color: clasifColor }}
            >
              {attempt.iq_score}
            </div>
            <p
              className="font-display text-2xl lg:text-3xl mt-3"
              style={{ color: clasifColor }}
            >
              {clasif}
            </p>
            <p className="text-ink/65 mt-4 text-[15px]">
              Superás al{" "}
              <span className="font-semibold text-ink">{attempt.percentil ?? 0}%</span> de la
              población.
            </p>
            <p className="text-[13px] font-mono text-ink/45 mt-2">
              {attempt.respuestas_correctas} / {attempt.total_preguntas} correctas
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-paper/90 backdrop-blur-sm p-6 lg:p-8 shadow-soft">
            <h2 className="font-display text-2xl mb-5">Desempeño por área</h2>
            <div className="space-y-4">
              {(Object.keys(AREA_META) as Area[]).map((a) => {
                const s = attempt.area_scores?.[a] ?? { correctas: 0, total: 15, porcentaje: 0 };
                const meta = AREA_META[a];
                return (
                  <div key={a}>
                    <div className="flex items-center justify-between text-[13px] mb-1.5">
                      <span className="font-medium text-ink">{meta.label}</span>
                      <span className="font-mono text-ink/60">
                        {s.correctas}/{s.total} · {s.porcentaje}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-cream/70 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${s.porcentaje}%`,
                          background: meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {showPaywall && !hasPro && (
        <PaywallModal onClose={() => setShowPaywall(false)} />
      )}
    </div>
  );
}

function PaywallModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-paper border-2 border-orange rounded-xl shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 lg:p-8 text-center border-b border-border">
          <div className="w-12 h-12 rounded-full bg-orange/10 inline-flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-orange" strokeWidth={2} />
          </div>
          <h2 className="font-display text-2xl lg:text-3xl tracking-tight">
            Desbloqueá tu resultado completo
          </h2>
          <p className="text-ink/60 mt-2 text-[14px]">
            Elegí cómo acceder a tu análisis cognitivo
          </p>
        </div>

        <div className="p-6 lg:p-8 grid md:grid-cols-2 gap-4">
          {/* Card 1 — único */}
          <div className="rounded-xl border border-border bg-cream/30 p-5 flex flex-col">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink/50">
              Resultado único
            </p>
            <p className="font-display text-3xl mt-2">
              $4 <span className="text-base text-ink/50">USD</span>
            </p>
            <p className="text-[12px] text-ink/55 mb-4">Pago único</p>
            <p className="text-[13px] text-ink/70 mb-4">Accedé solo a este resultado.</p>
            <ul className="space-y-1.5 text-[13px] text-ink/75 mb-5 flex-1">
              <Bullet>Puntuación IQ exacta</Bullet>
              <Bullet>Percentil y comparativa global</Bullet>
              <Bullet>Análisis por área</Bullet>
              <Bullet>Certificado PDF</Bullet>
            </ul>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="w-full h-10 bg-paper border border-ink/80 text-ink text-[13.5px] font-medium rounded-md hover:bg-ink hover:text-paper transition-colors"
            >
              Desbloquear por $4 →
            </button>
          </div>

          {/* Card 2 — Pro */}
          <div className="rounded-xl border-2 border-orange bg-paper p-5 flex flex-col relative shadow-orange">
            <span className="absolute -top-3 right-4 inline-flex items-center gap-1 px-2 py-0.5 bg-orange text-paper text-[10px] font-mono uppercase tracking-wider rounded">
              <Crown className="w-3 h-3" strokeWidth={2.5} /> Recomendado
            </span>
            <p className="text-[11px] font-mono uppercase tracking-wider text-orange">Plan Pro</p>
            <p className="font-display text-3xl mt-2">
              $12 <span className="text-base text-ink/50">USD/mes</span>
            </p>
            <p className="text-[12px] text-ink/55 mb-4">Renovación mensual</p>
            <p className="text-[13px] text-ink/70 mb-4">Acceso completo a Autodidactas.</p>
            <ul className="space-y-1.5 text-[13px] text-ink/80 mb-5 flex-1">
              <Bullet>Todo lo del resultado único</Bullet>
              <Bullet>Tests de IQ ilimitados con historial</Bullet>
              <Bullet>Estudio activo con IA</Bullet>
              <Bullet>Flashcards con repetición espaciada</Bullet>
              <Bullet>Resúmenes y mapas conceptuales</Bullet>
              <Bullet>Evaluaciones formativas</Bullet>
              <Bullet>Generación de podcasts didácticos</Bullet>
            </ul>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="w-full h-10 bg-ink text-paper text-[13.5px] font-medium rounded-md hover:bg-orange transition-colors"
            >
              Comenzar Plan Pro →
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-[11.5px] text-ink/50 mb-3">
            Los planes se renuevan mensualmente. Cancelá cuando quieras.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-[13px] text-ink/60 hover:text-ink transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
            No gracias, cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5">
      <Check className="w-3.5 h-3.5 text-orange flex-shrink-0 mt-0.5" strokeWidth={2.5} />
      <span>{children}</span>
    </li>
  );
}
