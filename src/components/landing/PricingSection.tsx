import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "./ConverterDemo";

type Cycle = "monthly" | "yearly";

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Para empezar a estudiar diferente.",
    monthly: 0,
    yearly: 0,
    cta: "Empezar gratis",
    highlighted: false,
    features: [
      "5 conversiones/día",
      "30 mensajes RAG/día",
      "Flashcards ilimitadas",
      "3 notebooks públicos",
      "10 min/día YouTube",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para estudiantes serios. El sweet spot.",
    monthly: 12,
    yearly: 115,
    cta: "Suscribirme a Pro",
    highlighted: true,
    features: [
      "IA ilimitada (chat y conversiones)",
      "Editor visual estilo Canva",
      "Texto a podcast (TTS)",
      "Notebooks públicos ilimitados",
      "120 min/día YouTube + TikTok",
      "Analytics avanzado",
    ],
  },
  {
    id: "teams",
    name: "Teams",
    description: "Para aulas, academias y empresas.",
    monthly: 29,
    yearly: 278,
    cta: "Hablar con ventas",
    highlighted: false,
    features: [
      "Todo lo de Pro · por usuario",
      "Aulas virtuales con asistencia",
      "Analytics de grupo",
      "SSO + roles",
      "Soporte prioritario",
    ],
  },
];

export function PricingSection() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeader
          eyebrow="Precios"
          title={
            <>
              Estudiá gratis. Subí cuando{" "}
              <span className="text-gradient-brand">vueles</span>.
            </>
          }
        />

        {/* Toggle */}
        <div className="mt-8 flex justify-center">
          <div
            className="relative inline-flex p-1 rounded-full border border-border"
            style={{ background: "oklch(15% 0.02 264)" }}
          >
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className="relative z-10 px-5 py-2 text-sm font-medium rounded-full transition-colors"
                style={{
                  color:
                    cycle === c ? "oklch(98% 0.005 264)" : "oklch(70% 0.01 264)",
                }}
              >
                {cycle === c && (
                  <motion.span
                    layoutId="cycle-pill"
                    className="absolute inset-0 rounded-full bg-gradient-brand shadow-glow-brand"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {c === "monthly" ? "Mensual" : "Anual"}
                  {c === "yearly" && (
                    <span className="ml-1.5 text-[10px] font-bold text-[oklch(82%_0.18_142)]">
                      −20%
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {PLANS.map((p, i) => {
            const price = cycle === "monthly" ? p.monthly : p.yearly;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative rounded-2xl p-px"
                style={
                  p.highlighted
                    ? { background: "var(--gradient-brand)" }
                    : { background: "oklch(30% 0.04 264)" }
                }
              >
                {p.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-brand text-primary-foreground shadow-glow-brand"
                  >
                    ★ Más popular
                  </div>
                )}
                <div
                  className="rounded-[15px] h-full p-7 flex flex-col"
                  style={{ background: "var(--gradient-card)" }}
                >
                  <div>
                    <div className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                      {p.name}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {p.description}
                    </div>
                  </div>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span
                      className="font-display font-bold"
                      style={{ fontSize: "clamp(2.5rem, 4vw, 3rem)" }}
                    >
                      {price === 0 ? "$0" : `$${price}`}
                    </span>
                    {price !== 0 && (
                      <span className="text-muted-foreground text-sm">
                        /{cycle === "monthly" ? "mes" : "año"}
                        {p.id === "teams" && " · usuario"}
                      </span>
                    )}
                  </div>

                  <ul className="mt-7 space-y-3 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span
                          className="mt-0.5 inline-flex w-4 h-4 rounded-full items-center justify-center text-[10px] flex-shrink-0"
                          style={{
                            background: "oklch(78% 0.22 142 / 0.18)",
                            color: "oklch(82% 0.18 142)",
                          }}
                        >
                          ✓
                        </span>
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/auth"
                    className="mt-8 inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition-all active:scale-[0.97]"
                    style={
                      p.highlighted
                        ? {
                            background: "var(--gradient-brand)",
                            color: "oklch(98% 0.005 264)",
                            boxShadow: "var(--glow-brand)",
                          }
                        : {
                            background: "transparent",
                            color: "oklch(96% 0.005 264)",
                            border: "1px solid oklch(30% 0.04 264)",
                          }
                    }
                  >
                    {p.cta}
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
