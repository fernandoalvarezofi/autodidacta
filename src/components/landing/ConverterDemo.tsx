import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INPUTS = [
  { id: "pdf", label: "PDF", icon: "📄" },
  { id: "audio", label: "Audio", icon: "🎙️" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "manuscript", label: "Manuscrito", icon: "✍️" },
  { id: "word", label: "Word", icon: "📝" },
  { id: "text", label: "Texto", icon: "📋" },
] as const;

const SAMPLE = {
  pdf: { title: "termodinámica-cap4.pdf", meta: "12 páginas · 2.4 MB" },
  audio: { title: "clase-mecánica-cuántica.mp3", meta: "47 min · 31 MB" },
  youtube: { title: "youtube.com/watch?v=…", meta: "Khan Academy · 18 min" },
  tiktok: { title: "tiktok.com/@profe.fis…", meta: "Tip de derivadas · 1:42" },
  manuscript: { title: "apuntes-bioquímica.jpg", meta: "Manuscrito · OCR" },
  word: { title: "ensayo-historia.docx", meta: "8 páginas · 1.1 MB" },
  text: { title: "Notas pegadas", meta: "4.200 caracteres" },
} as const;

export function ConverterDemo() {
  const [active, setActive] = useState<(typeof INPUTS)[number]["id"]>("pdf");
  const sample = SAMPLE[active];

  return (
    <section id="demo" className="relative py-28">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeader
          eyebrow="Motor universal"
          title={
            <>
              Cualquier formato.{" "}
              <span className="text-gradient-brand">Un resultado.</span>
            </>
          }
          subtitle="Subí lo que tengas. La IA hace el resto en segundos."
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Inputs */}
          <div className="rounded-2xl bg-gradient-card border border-border p-6 sm:p-8 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Entrada
            </div>
            <div className="flex flex-wrap gap-2">
              {INPUTS.map((i) => {
                const isActive = i.id === active;
                return (
                  <button
                    key={i.id}
                    onClick={() => setActive(i.id)}
                    className="relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: isActive
                        ? "oklch(98% 0.005 264)"
                        : "oklch(70% 0.01 264)",
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-lg bg-gradient-brand shadow-glow-brand"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span>{i.icon}</span>
                      {i.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Preview del input */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mt-6 rounded-xl border border-border p-5 bg-background/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-brand-soft flex items-center justify-center text-2xl">
                    {INPUTS.find((i) => i.id === active)?.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-sm truncate">{sample.title}</div>
                    <div className="text-xs text-muted-foreground">{sample.meta}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-1.5 rounded-full bg-elevated overflow-hidden">
                    <motion.div
                      key={active}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                      className="h-full bg-gradient-brand"
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Procesando · extrayendo conceptos clave…
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Outputs */}
          <div className="rounded-2xl bg-gradient-card border border-border p-6 sm:p-8 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Salidas generadas
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { i: "📑", t: "Resumen", c: "brand" },
                { i: "🗺️", t: "Mapa mental", c: "secondary" },
                { i: "🎴", t: "Flashcards", c: "accent" },
                { i: "❓", t: "Quiz MCQ", c: "warning" },
                { i: "🎧", t: "Podcast", c: "secondary" },
                { i: "📘", t: "Word", c: "brand" },
              ].map((o, i) => (
                <motion.div
                  key={o.t}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="rounded-xl border border-border p-4 hover:border-brand-glow transition-colors group"
                  style={{ background: "oklch(15% 0.02 264 / 0.6)" }}
                >
                  <div className="text-2xl mb-2">{o.i}</div>
                  <div className="font-semibold">{o.t}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Listo para estudiar
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="inline-block text-xs font-mono uppercase tracking-widest text-brand mb-3">
        {eyebrow}
      </div>
      <h2
        className="font-display font-bold tracking-tight"
        style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-muted-foreground text-lg">{subtitle}</p>
      )}
    </div>
  );
}
