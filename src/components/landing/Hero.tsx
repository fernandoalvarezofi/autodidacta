import { motion } from "framer-motion";
import { ArrowRight, Brain } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StudyMockup } from "./StudyMockup";

export function Hero() {
  return (
    <section className="relative border-b-2 border-ink overflow-hidden">
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-16 lg:py-24">
        {/* Top label rule */}
        <div className="flex items-center gap-3 mb-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">Vol. I</span>
          <span className="w-12 h-px bg-ink/30" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/60">Estudio activo basado en evidencia</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8"
          >
            <h1
              className="font-display leading-[0.92] tracking-[-0.025em]"
              style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
            >
              El estudio,<br/>
              <span className="italic text-orange">reconcebido</span><br/>
              para hoy.
            </h1>

            <p className="mt-8 max-w-[58ch] text-[16px] lg:text-[17px] text-ink/75 leading-relaxed">
              Convertí cualquier material —documentos, audio, video, manuscritos— en herramientas de estudio activo: resúmenes estructurados, flashcards con repetición espaciada y evaluaciones formativas.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-3 px-7 py-4 bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.25em] hover:bg-orange transition-colors shadow-[6px_6px_0_0_var(--orange)] hover:shadow-[6px_6px_0_0_var(--ink)]"
              >
                Crear cuenta gratuita
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
              </Link>
              <Link
                to="/iq"
                className="group inline-flex items-center gap-3 px-6 py-4 border-2 border-ink text-ink font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-ink hover:text-paper transition-colors"
              >
                <Brain className="w-4 h-4" strokeWidth={2.25} /> Test de IQ
              </Link>
            </div>
          </motion.div>

          {/* Tabla editorial de stats */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-4 border-2 border-ink bg-paper"
          >
            <div className="border-b-2 border-ink px-5 py-3 bg-ink text-paper">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Cifras</p>
            </div>
            <dl className="divide-y-2 divide-ink/15">
              <StatRow k="Estudiantes" v="430k" />
              <StatRow k="Universidades" v="120+" />
              <StatRow k="Calificación" v="4.8/5" />
              <StatRow k="Idioma" v="ES" />
            </dl>
          </motion.aside>
        </div>

        {/* Mockup brutalista */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 relative"
        >
          <div className="border-2 border-ink overflow-hidden shadow-[10px_10px_0_0_var(--ink)]">
            <StudyMockup />
          </div>
          <figcaption className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50 text-center">
            Fig. 1 · Vista del cuaderno · Termodinámica · Capítulo IV
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

function StatRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between px-5 py-3.5">
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">{k}</dt>
      <dd className="font-display text-2xl tabular-nums">{v}</dd>
    </div>
  );
}
