import { motion } from "framer-motion";
import { ArrowRight, Brain } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroCollage from "@/assets/hero-collage.jpg";

export function Hero() {
  return (
    <section className="relative border-b-2 border-ink overflow-hidden">
      {/* Bloques decorativos de color al fondo */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-mustard rotate-6 -z-0 opacity-90" aria-hidden />
      <div className="absolute top-40 -right-16 w-56 h-56 bg-cobalt-soft -rotate-3 -z-0" aria-hidden />
      <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-sage-soft rotate-12 -z-0" aria-hidden />

      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-16 lg:py-24 relative">
        <div className="flex items-center gap-3 mb-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">Vol. I</span>
          <span className="w-12 h-px bg-ink/30" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/60">
            Estudio activo basado en evidencia
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <h1
              className="font-display leading-[0.92] tracking-[-0.025em]"
              style={{ fontSize: "clamp(2.8rem, 8vw, 6.5rem)" }}
            >
              El estudio,<br />
              <span className="italic text-orange">reconcebido</span><br />
              <span className="text-cobalt">para hoy.</span>
            </h1>

            <p className="mt-8 max-w-[58ch] text-[16px] lg:text-[17px] text-ink/80 leading-relaxed">
              Convertí cualquier material —documentos, audio, video, manuscritos— en herramientas de
              estudio activo: resúmenes estructurados, flashcards con repetición espaciada y evaluaciones
              formativas.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-3 px-7 py-4 bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.25em] hover:bg-orange transition-colors shadow-[6px_6px_0_0_var(--orange)] hover:shadow-[6px_6px_0_0_var(--cobalt)]"
              >
                Crear cuenta gratuita
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
              </Link>
              <Link
                to="/iq"
                className="group inline-flex items-center gap-3 px-6 py-4 border-2 border-ink text-ink font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-cobalt hover:text-paper hover:border-cobalt transition-colors"
              >
                <Brain className="w-4 h-4" strokeWidth={2.25} /> Test de IQ
              </Link>
            </div>
          </motion.div>

          {/* Imagen collage editorial */}
          <motion.figure
            initial={{ opacity: 0, y: 16, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 translate-x-3 translate-y-3 bg-cobalt -z-10" aria-hidden />
            <div className="absolute inset-0 -translate-x-2 -translate-y-2 bg-mustard -z-20" aria-hidden />
            <div className="border-2 border-ink overflow-hidden bg-paper">
              <img
                src={heroCollage}
                alt="Collage editorial de un lector con formas geométricas, arcos arquitectónicos y diagramas matemáticos"
                width={1024}
                height={1024}
                className="w-full h-auto block"
              />
            </div>
            <figcaption className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50 text-center">
              Fig. 1 · El estudio como acto creativo
            </figcaption>
          </motion.figure>
        </div>

        {/* Tabla de cifras horizontal con colores */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 border-2 border-ink"
        >
          <StatCell k="Estudiantes" v="430k" tone="paper" />
          <StatCell k="Universidades" v="120+" tone="cobalt" />
          <StatCell k="Calificación" v="4.8/5" tone="mustard" />
          <StatCell k="Idioma" v="ES-AR" tone="sage" last />
        </motion.div>
      </div>
    </section>
  );
}

function StatCell({
  k,
  v,
  tone,
  last,
}: {
  k: string;
  v: string;
  tone: "paper" | "cobalt" | "mustard" | "sage";
  last?: boolean;
}) {
  const tones = {
    paper: "bg-paper text-ink",
    cobalt: "bg-cobalt-soft text-ink",
    mustard: "bg-mustard-soft text-ink",
    sage: "bg-sage-soft text-ink",
  } as const;
  return (
    <div className={`px-6 py-6 ${tones[tone]} ${!last ? "border-r-2 border-ink last:border-r-0" : ""}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/65 mb-2">{k}</p>
      <p className="font-display text-4xl lg:text-5xl tabular-nums leading-none">{v}</p>
    </div>
  );
}
