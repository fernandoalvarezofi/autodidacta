import { motion } from "framer-motion";
import { MacbookMockup } from "./MacbookMockup";
import { HeroParticles } from "./HeroParticles";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-28 pb-32 lg:pt-36 lg:pb-40">
      {/* Mesh gradient animado */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-mesh animate-mesh-move"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 10%, transparent, oklch(12% 0.02 264) 75%)",
        }}
      />
      <HeroParticles />

      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-fit flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border-brand-glow"
          style={{ background: "oklch(65% 0.25 264 / 0.08)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shadow-glow-success" />
          Nuevo · Motor de conversión universal con IA
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 text-center font-display font-bold tracking-tight leading-[0.95]"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
        >
          Convertí cualquier cosa
          <br className="hidden sm:block" /> en{" "}
          <span className="text-gradient-brand">conocimiento</span>.
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 max-w-2xl mx-auto text-center text-base sm:text-lg text-muted-foreground"
        >
          PDF, audio, video, manuscrito — en segundos tenés tu resumen,
          flashcards y quiz listos para estudiar como nunca antes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="/auth"
            className="group relative inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-primary-foreground bg-gradient-brand shadow-glow-brand transition-transform active:scale-[0.97] hover:scale-[1.02]"
          >
            Empezar gratis
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="#demo"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-foreground border-brand-glow transition-colors hover:bg-[oklch(65%_0.25_264_/_0.1)]"
          >
            Ver cómo funciona
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-7 flex items-center justify-center gap-3 text-sm text-muted-foreground"
        >
          <div className="flex -space-x-2">
            {[
              "oklch(65% 0.25 264)",
              "oklch(72% 0.20 195)",
              "oklch(78% 0.22 142)",
              "oklch(75% 0.18 55)",
            ].map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-background"
                style={{ background: c }}
              />
            ))}
          </div>
          <span>
            <strong className="text-foreground">430.000+</strong> estudiantes
          </span>
          <span className="opacity-50">·</span>
          <span>
            <strong className="text-foreground">4.8</strong> ★★★★★
          </span>
        </motion.div>

        {/* Macbook */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 lg:mt-20"
        >
          <MacbookMockup />
        </motion.div>
      </div>
    </section>
  );
}
