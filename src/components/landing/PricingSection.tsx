import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

type Cycle = "monthly" | "yearly";

const PLANS = [
  {
    id: "free",
    name: "Estudiante",
    description: "Para comenzar a estudiar de forma activa.",
    monthly: 0,
    yearly: 0,
    cta: "Comenzar gratis",
    highlighted: false,
    features: [
      "5 conversiones por día",
      "30 consultas al tutor por día",
      "Tarjetas con repetición espaciada ilimitadas",
      "3 cuadernos públicos",
    ],
  },
  {
    id: "pro",
    name: "Académico",
    description: "Para estudiantes universitarios y profesionales.",
    monthly: 12,
    yearly: 115,
    cta: "Suscribirme",
    highlighted: true,
    features: [
      "IA sin límites en conversiones y tutor",
      "Editor visual de resúmenes",
      "Generación de podcast didáctico",
      "Cuadernos públicos ilimitados",
      "Analítica detallada de aprendizaje",
    ],
  },
  {
    id: "teams",
    name: "Institucional",
    description: "Para cátedras, academias e instituciones educativas.",
    monthly: 29,
    yearly: 278,
    cta: "Hablar con ventas",
    highlighted: false,
    features: [
      "Todo lo del plan Académico, por usuario",
      "Aulas virtuales con seguimiento de asistencia",
      "Analítica de cohorte",
      "SSO y administración de roles",
      "Soporte académico dedicado",
    ],
  },
];

export function PricingSection() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <section id="planes" className="py-24 lg:py-32 bg-cream border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px]">
        <SectionHeader
          number="04"
          eyebrow="Planes"
          title={
            <>
              Empezá gratis. Crecé{" "}
              <span className="italic text-orange font-normal">
                cuando lo necesites
              </span>
              .
            </>
          }
        />

        {/* Toggle */}
        <div className="mt-10 inline-flex border border-ink">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                cycle === c
                  ? "bg-ink text-paper"
                  : "bg-transparent text-ink hover:bg-ink/5"
              }`}
            >
              {c === "monthly" ? "Mensual" : "Anual"}
              {c === "yearly" && (
                <span className="ml-2 text-[10px] font-mono">−20%</span>
              )}
            </button>
          ))}
        </div>

        {/* Plans */}
        <div className="mt-12 grid md:grid-cols-3 gap-px bg-border border border-border">
          {PLANS.map((p, i) => {
            const price = cycle === "monthly" ? p.monthly : p.yearly;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative p-8 lg:p-10 flex flex-col ${
                  p.highlighted ? "bg-paper" : "bg-paper/60"
                }`}
              >
                {p.highlighted && (
                  <div className="absolute top-0 left-0 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.15em] bg-ink text-paper">
                    Recomendado
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/55">
                    Plan {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm text-ink/65 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-8 flex items-baseline gap-1.5">
                  <span
                    className="font-display font-semibold tracking-tight"
                    style={{ fontSize: "clamp(2.5rem, 4vw, 3rem)" }}
                  >
                    {price === 0 ? "Gratis" : `US$${price}`}
                  </span>
                  {price !== 0 && (
                    <span className="text-ink/55 text-sm">
                      /{cycle === "monthly" ? "mes" : "año"}
                      {p.id === "teams" && " · usuario"}
                    </span>
                  )}
                </div>

                <div className="mt-6 rule-thin pt-6">
                  <ul className="space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className="w-4 h-4 text-orange mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                        />
                        <span className="text-ink/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="/auth"
                  className={`mt-10 inline-flex items-center justify-center px-5 py-3 text-sm font-medium transition-colors ${
                    p.highlighted
                      ? "bg-ink text-paper hover:bg-orange-deep"
                      : "border border-ink text-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  {p.cta}
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
