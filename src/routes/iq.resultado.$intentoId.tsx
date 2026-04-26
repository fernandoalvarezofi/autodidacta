import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Crown, Check, X, Loader2, Sparkles, FileText, BarChart3, History } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { NeuralBackground } from "@/components/NeuralBackground";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
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
  const { isActive: hasPro } = useSubscription();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
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

  // El percentil aproximado lo mostramos en rangos en el plan gratuito
  const percentilRango = (() => {
    const p = attempt.percentil ?? 50;
    if (p < 10) return "Inferior al 10%";
    if (p < 25) return "Entre 10–25%";
    if (p < 50) return "Entre 25–50%";
    if (p < 75) return "Entre 50–75%";
    if (p < 90) return "Entre 75–90%";
    if (p < 98) return "Entre 90–98%";
    return "Top 2%";
  })();

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

        {/* Resultado siempre visible */}
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
            Aproximadamente: <span className="font-semibold text-ink">{percentilRango}</span> de la población.
          </p>
          <p className="text-[13px] font-mono text-ink/45 mt-2">
            {attempt.respuestas_correctas} / {attempt.total_preguntas} correctas
          </p>
        </section>

        {/* Sección Pro: visible para todos pero blureada si no tienen plan */}
        <section className="mt-6 rounded-2xl border border-border bg-paper/90 backdrop-blur-sm p-6 lg:p-8 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl">Análisis detallado por área</h2>
            {!hasPro && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange/10 border border-orange/30 text-orange text-[10px] font-mono uppercase tracking-wider rounded">
                <Lock className="w-2.5 h-2.5" strokeWidth={2.5} /> Plan Pro
              </span>
            )}
          </div>
          <div className={!hasPro ? "filter blur-md pointer-events-none select-none" : ""}>
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
          </div>

          {!hasPro && (
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-paper via-paper/80 to-transparent pt-20 pb-6 px-6">
              <button
                type="button"
                onClick={() => setShowPaywall(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-paper text-[13.5px] font-medium rounded-md hover:bg-orange transition-colors shadow-soft"
              >
                <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                Desbloquear análisis completo
              </button>
            </div>
          )}
        </section>

        {/* Bloque Pro adicional */}
        {!hasPro && (
          <section className="mt-6 rounded-2xl border-2 border-orange bg-paper p-6 lg:p-8 shadow-orange">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange/10 inline-flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-orange" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl lg:text-2xl">Llevá tu análisis al siguiente nivel</h3>
                <p className="text-ink/65 text-[14px] mt-1.5">
                  Plan Pro a <span className="font-semibold text-ink">$12 USD/mes</span> con renovación automática.
                </p>
                <ul className="mt-4 grid sm:grid-cols-2 gap-x-4 gap-y-2 text-[13.5px] text-ink/80">
                  <Bullet icon={<BarChart3 className="w-3.5 h-3.5" />}>
                    Percentil exacto y comparativa global
                  </Bullet>
                  <Bullet icon={<BarChart3 className="w-3.5 h-3.5" />}>
                    Análisis detallado por área
                  </Bullet>
                  <Bullet icon={<FileText className="w-3.5 h-3.5" />}>
                    Certificado PDF descargable
                  </Bullet>
                  <Bullet icon={<History className="w-3.5 h-3.5" />}>
                    Tests ilimitados con historial
                  </Bullet>
                  <Bullet icon={<Sparkles className="w-3.5 h-3.5" />}>
                    Estudio activo con IA
                  </Bullet>
                  <Bullet icon={<Sparkles className="w-3.5 h-3.5" />}>
                    Flashcards, resúmenes y mapas
                  </Bullet>
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaywall(true)}
                    className="inline-flex items-center gap-2 h-10 px-5 bg-ink text-paper text-[13.5px] font-medium rounded-md hover:bg-orange transition-colors"
                  >
                    Suscribirme al Plan Pro
                  </button>
                  <p className="text-[11.5px] text-ink/50">
                    Cancelá cuando quieras desde tu cuenta.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {showPaywall && !hasPro && (
        <PaywallModal onClose={() => setShowPaywall(false)} />
      )}
    </div>
  );
}

function PaywallModal({ onClose }: { onClose: () => void }) {
  const { openCheckout, loading } = usePaddleCheckout();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-paper border-2 border-orange rounded-xl shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center border-b border-border">
          <div className="w-12 h-12 rounded-full bg-orange/10 inline-flex items-center justify-center mb-3">
            <Crown className="w-5 h-5 text-orange" strokeWidth={2} />
          </div>
          <h2 className="font-display text-2xl tracking-tight">Plan Pro Autodidactas</h2>
          <p className="text-ink/60 mt-1.5 text-[13.5px]">Acceso completo + análisis IQ avanzado</p>
        </div>

        <div className="p-6 space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => openCheckout({ priceId: "pro_monthly" })}
            className="w-full rounded-xl border-2 border-orange bg-cream/30 hover:bg-cream/60 p-4 text-left transition-colors disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-orange">Mensual</p>
                <p className="font-display text-2xl mt-0.5">$12 <span className="text-sm text-ink/50">USD/mes</span></p>
              </div>
              <span className="text-[12px] font-medium text-ink">Elegir →</span>
            </div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => openCheckout({ priceId: "pro_yearly" })}
            className="w-full rounded-xl border border-ink/15 hover:border-ink/40 bg-paper p-4 text-left transition-colors disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-ink/60">Anual</p>
                  <span className="text-[10px] font-mono text-orange uppercase px-1.5 py-0.5 bg-orange/10 rounded">-25%</span>
                </div>
                <p className="font-display text-2xl mt-0.5">$108 <span className="text-sm text-ink/50">USD/año</span></p>
                <p className="text-[11.5px] text-ink/55 mt-0.5">Equivale a $9/mes</p>
              </div>
              <span className="text-[12px] font-medium text-ink">Elegir →</span>
            </div>
          </button>

          <ul className="mt-4 space-y-1.5 text-[13px] text-ink/80">
            <Bullet>Puntuación IQ con percentil exacto y análisis por área</Bullet>
            <Bullet>Certificado PDF descargable</Bullet>
            <Bullet>Tests ilimitados + estudio activo con IA</Bullet>
          </ul>

          <p className="text-[11px] text-ink/50 text-center pt-1">
            Renovación automática · cancelá cuando quieras
          </p>
        </div>

        <div className="px-6 pb-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-[13px] text-ink/60 hover:text-ink transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
            Tal vez después
          </button>
        </div>
      </div>
    </div>
  );
}

function Bullet({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5">
      <span className="text-orange flex-shrink-0 mt-0.5">
        {icon ?? <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
      </span>
      <span>{children}</span>
    </li>
  );
}
