import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { StudyMockup } from "./StudyMockup";

export function Hero() {
  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Grid background con fade */}
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      {/* Glow superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] relative">
        {/* Badge superior tipo Vercel */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <a
            href="#metodo"
            className="group inline-flex items-center gap-2 px-3 py-1.5 text-[12px] bg-cream/60 border border-border hover:border-orange/40 hover:bg-cream transition-all rounded-full backdrop-blur-sm"
          >
            <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 bg-orange/15 text-orange rounded-full text-[10px] font-mono uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} /> Nuevo
            </span>
            <span className="text-ink/80">Estudio activo basado en evidencia</span>
            <ArrowRight className="w-3 h-3 text-ink/40 group-hover:text-orange group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
          </a>
        </motion.div>

        {/* Headline centrado, masivo, tight */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display font-semibold leading-[0.98] tracking-[-0.035em]"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
          >
            El estudio,
            <br />
            <span className="bg-gradient-to-br from-ink via-ink to-orange/80 bg-clip-text text-transparent">
              reconcebido para hoy.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-7 text-[17px] lg:text-lg text-ink/65 max-w-[60ch] mx-auto leading-relaxed"
          >
            Convertí cualquier material —documentos, audio, video o manuscritos— en
            herramientas de estudio activo: resúmenes estructurados, flashcards con
            repetición espaciada y evaluaciones formativas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="/auth"
              className="group inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper text-[14px] font-medium hover:bg-orange transition-colors rounded-md shadow-soft"
            >
              Crear cuenta gratuita
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </a>
            <a
              href="#metodo"
              className="inline-flex items-center gap-2 px-5 py-3 text-[14px] text-ink/80 hover:text-ink border border-border hover:border-ink/40 hover:bg-cream/50 transition-all rounded-md"
            >
              Conocer el método
            </a>
          </motion.div>

          {/* Stats inline pequeñas */}
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            <Stat label="Estudiantes" value="430k" />
            <span className="hidden sm:block w-px h-8 bg-border" />
            <Stat label="Universidades" value="120+" />
            <span className="hidden sm:block w-px h-8 bg-border" />
            <Stat label="Calificación" value="4.8/5" />
          </motion.dl>
        </div>

        {/* Mockup con borde luminoso */}
        <motion.figure
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 lg:mt-24 relative"
        >
          {/* Glow detrás del mockup */}
          <div className="absolute -inset-4 bg-gradient-to-b from-orange/20 via-orange/5 to-transparent blur-2xl opacity-60 -z-10" />
          {/* Borde con highlight */}
          <div className="relative rounded-xl p-px bg-gradient-to-b from-border via-border to-transparent">
            <div className="rounded-[11px] overflow-hidden bg-paper">
              <StudyMockup />
            </div>
          </div>
          <figcaption className="mt-5 text-[11px] font-mono uppercase tracking-[0.15em] text-ink/40 text-center">
            Vista del cuaderno · Termodinámica · Capítulo IV
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <dd className="font-display text-2xl font-semibold tracking-tight text-ink">
        {value}
      </dd>
      <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/45 mt-0.5">
        {label}
      </dt>
    </div>
  );
}
