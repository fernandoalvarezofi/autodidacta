import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { StudyMockup } from "./StudyMockup";

export function Hero() {
  return (
    <section className="relative pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px]">
        {/* Eyebrow tipo journal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8 text-xs font-mono uppercase tracking-[0.18em] text-ink/60"
        >
          <span className="w-8 h-px bg-ink/40" />
          <span>Vol. I · No. 1 · Plataforma de estudio</span>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          {/* Texto */}
          <div className="lg:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display font-semibold leading-[1.02] tracking-[-0.025em]"
              style={{ fontSize: "clamp(2.75rem, 6.5vw, 5.25rem)" }}
            >
              El estudio,
              <br />
              <span className="italic text-orange font-normal">reconcebido</span>{" "}
              para el<br />estudiante moderno.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-8 text-lg lg:text-xl text-ink/75 max-w-[58ch] leading-relaxed"
            >
              Autodidactas convierte cualquier material —documentos, audio,
              video o manuscritos— en herramientas de estudio activo basadas en
              evidencia: resúmenes estructurados, flashcards con repetición
              espaciada y evaluaciones formativas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <a
                href="/auth"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-paper text-sm font-medium hover:bg-orange-deep transition-colors"
              >
                Crear cuenta gratuita
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </a>
              <a
                href="#metodo"
                className="text-sm text-ink underline underline-offset-4 decoration-1 decoration-ink/30 hover:decoration-orange hover:text-orange transition-colors"
              >
                Conocer el método
              </a>
            </motion.div>
          </div>

          {/* Bloque lateral académico — datos */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-5 lg:pl-10 lg:border-l lg:border-border"
          >
            <div className="text-xs font-mono uppercase tracking-[0.15em] text-ink/60 mb-5">
              Resumen
            </div>
            <p className="font-display text-lg leading-snug text-ink/85">
              Una herramienta de aprendizaje basada en cuatro pilares de la
              ciencia cognitiva: <em>recuperación activa</em>,{" "}
              <em>repetición espaciada</em>, <em>elaboración</em> y{" "}
              <em>evaluación formativa</em>.
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-6">
              <Stat label="Estudiantes" value="430k" />
              <Stat label="Universidades" value="120+" />
              <Stat label="Calificación" value="4.8/5" />
            </dl>
          </motion.aside>
        </div>

        {/* Mockup editorial */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 lg:mt-24"
        >
          <StudyMockup />
          <figcaption className="mt-4 text-xs font-mono uppercase tracking-[0.15em] text-ink/55 text-center">
            Fig. 1 — Vista del cuaderno de estudio · Termodinámica · Capítulo IV
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink/55 mb-1.5">
        {label}
      </dt>
      <dd className="font-display text-2xl font-semibold tracking-tight">
        {value}
      </dd>
    </div>
  );
}
