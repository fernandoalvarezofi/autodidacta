import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import {
  Brain,
  Repeat,
  PenLine,
  ClipboardCheck,
} from "lucide-react";

const PILLARS = [
  {
    icon: Brain,
    name: "Recuperación activa",
    desc: "Recordar es más efectivo que releer. Cada sesión te exige producir la respuesta antes de mostrarla.",
    cite: "Karpicke & Roediger, 2008",
  },
  {
    icon: Repeat,
    name: "Repetición espaciada",
    desc: "El algoritmo SM-2 calcula el momento óptimo para revisar cada concepto antes de que lo olvides.",
    cite: "Ebbinghaus, 1885 · Wozniak, 1990",
  },
  {
    icon: PenLine,
    name: "Elaboración",
    desc: "El tutor socrático guía con preguntas en lugar de dar respuestas, fortaleciendo la comprensión profunda.",
    cite: "Chi et al., 1994",
  },
  {
    icon: ClipboardCheck,
    name: "Evaluación formativa",
    desc: "Mini-exámenes adaptativos identifican brechas y ajustan el material que necesitás repasar.",
    cite: "Black & Wiliam, 1998",
  },
];

export function MethodSection() {
  return (
    <section id="metodo" className="py-24 lg:py-32 border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px]">
        <SectionHeader
          number="01"
          eyebrow="Método"
          title={
            <>
              Cuatro principios de la ciencia cognitiva.{" "}
              <span className="italic text-orange font-normal">
                Una sola plataforma.
              </span>
            </>
          }
          subtitle="Autodidactas no es una app de notas: es un sistema de estudio activo cuyo diseño se basa en cinco décadas de investigación sobre cómo aprende el cerebro humano."
        />

        <div className="mt-16 grid md:grid-cols-2 gap-x-12 gap-y-14 max-w-5xl">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.article
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative pl-12"
              >
                <div className="absolute left-0 top-1 flex items-center justify-center w-8 h-8 border border-ink">
                  <Icon className="w-4 h-4 text-ink" strokeWidth={1.5} />
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/55 mb-2">
                  Pilar {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-2xl font-semibold leading-tight">
                  {p.name}
                </h3>
                <p className="mt-3 text-ink/75 leading-relaxed">{p.desc}</p>
                <p className="mt-3 text-xs font-mono text-ink/50 italic">
                  {p.cite}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
