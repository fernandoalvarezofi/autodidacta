import { motion } from "framer-motion";
import { SectionHeader } from "./ConverterDemo";

const FEATURES = [
  {
    icon: "⚡",
    title: "Motor de conversión",
    desc: "7 formatos de entrada, 7 herramientas de salida.",
    glow: "var(--glow-brand)",
  },
  {
    icon: "🎨",
    title: "Editor visual Canva-style",
    desc: "Resúmenes hermosos en segundos.",
    glow: "var(--glow-cyan)",
  },
  {
    icon: "⚔️",
    title: "Quiz competitivo",
    desc: "Retá a tus compañeros en tiempo real.",
    glow: "var(--glow-warning)",
  },
  {
    icon: "🤖",
    title: "Tutor socrático",
    desc: "Aprendé pensando, no memorizando.",
    glow: "var(--glow-brand)",
  },
  {
    icon: "🧠",
    title: "Repetición espaciada",
    desc: "SM-2: repasá en el momento exacto.",
    glow: "var(--glow-success)",
  },
  {
    icon: "🌐",
    title: "Notebooks compartibles",
    desc: "Compartí tu estudio. Viralizate gratis.",
    glow: "var(--glow-cyan)",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeader
          eyebrow="Features"
          title={
            <>
              Todo lo que necesitás para{" "}
              <span className="text-gradient-brand">estudiar mejor</span>.
            </>
          }
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative rounded-2xl bg-gradient-card border border-border p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-glow"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-5 transition-shadow duration-300 group-hover:shadow-glow-brand"
                style={{ background: "var(--gradient-brand-soft)" }}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-display font-bold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
