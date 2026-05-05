import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, History } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/iq/")({
  head: () => ({
    meta: [
      { title: "Test de IQ — Autodidactas" },
      { name: "description", content: "Evaluación cognitiva: 60 preguntas que miden razonamiento lógico, numérico, espacial y verbal." },
      { property: "og:title", content: "Test de IQ — Autodidactas" },
      { property: "og:description", content: "60 preguntas estandarizadas. Descubrí cómo funciona tu mente en 20 minutos." },
    ],
  }),
  component: IQLanding,
});

function IQLanding() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      {/* HERO editorial brutalista con vida */}
      <section className="border-b-2 border-ink relative overflow-hidden">
        {/* bloques decorativos */}
        <div className="absolute -top-12 right-10 w-48 h-48 bg-cobalt rotate-12 -z-0 opacity-90" aria-hidden />
        <div className="absolute top-1/3 -left-10 w-32 h-32 bg-mustard -rotate-6 -z-0" aria-hidden />
        <div className="absolute bottom-10 right-1/4 w-24 h-24 bg-sage rotate-3 -z-0" aria-hidden />

        <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-end relative">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">Vol. I</span>
              <span className="w-12 h-px bg-ink/30" />
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/60">Evaluación cognitiva</span>
            </div>

            <h1
              className="font-display leading-[0.92] tracking-[-0.025em]"
              style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
            >
              Test de<br/>
              <span className="italic text-orange">Cociente</span><br/>
              <span className="text-cobalt">Intelectual.</span>
            </h1>

            <p className="mt-8 max-w-[55ch] text-[16px] lg:text-[17px] text-ink/75 leading-relaxed">
              Sesenta preguntas estandarizadas. Cuatro áreas. Veinte minutos. Sin registro previo, sin trampas, sin promesas vacías. Una medición rigurosa de cómo razona tu mente —ahora.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/iq/inicio"
                className="group inline-flex items-center gap-3 h-13 px-7 py-4 bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.25em] hover:bg-orange transition-colors shadow-[6px_6px_0_0_var(--orange)] hover:shadow-[6px_6px_0_0_var(--ink)]"
              >
                Comenzar test
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
              </Link>
              {user && (
                <Link
                  to="/iq/historial"
                  className="inline-flex items-center gap-2 h-13 px-5 py-4 border-2 border-ink text-ink font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-ink hover:text-paper transition-colors"
                >
                  <History className="w-4 h-4" strokeWidth={2.25} /> Mi historial
                </Link>
              )}
            </div>
          </div>

          {/* Tabla editorial de specs */}
          <aside className="lg:col-span-4 border-2 border-ink bg-paper">
            <div className="border-b-2 border-ink px-5 py-3 bg-ink text-paper">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Ficha técnica</p>
            </div>
            <dl className="divide-y-2 divide-ink/15">
              <SpecRow k="Preguntas" v="60" />
              <SpecRow k="Áreas cognitivas" v="04" />
              <SpecRow k="Duración máxima" v="20:00" />
              <SpecRow k="Rango IQ" v="55–160" />
              <SpecRow k="Costo" v="$0" />
            </dl>
          </aside>
        </div>
      </section>

      {/* Áreas — grid editorial con colores propios */}
      <section className="border-b-2 border-ink bg-cream/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-dots-orange opacity-50" aria-hidden />
        <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-16 lg:py-24 relative">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <h2 className="font-display tracking-[-0.02em]" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Cuatro áreas,<br/><span className="italic text-cobalt">un panorama completo.</span>
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">§ 01–04</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-2 border-ink bg-paper">
            <AreaCell n="01" title="Lógica" desc="Deducción, secuencias y analogías." tone="crimson" />
            <AreaCell n="02" title="Numérico" desc="Series, aritmética y álgebra." tone="cobalt" />
            <AreaCell n="03" title="Espacial" desc="Rotaciones, simetrías y patrones." tone="mustard" />
            <AreaCell n="04" title="Verbal" desc="Sinónimos, analogías, comprensión." tone="sage" last />
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="border-b-2 border-ink">
        <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-16 lg:py-24">
          <div className="text-center mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">Resultado</span>
            <h2 className="font-display mt-3 tracking-[-0.02em]" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Lo que vas a recibir.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-0 max-w-3xl mx-auto border-2 border-ink">
            <div className="p-7 border-b-2 md:border-b-0 md:border-r-2 border-ink">
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">Gratis</span>
                <span className="font-display text-3xl">$0</span>
              </div>
              <p className="font-display text-2xl mb-5">Resultado básico</p>
              <ul className="space-y-2.5">
                <ProItem>Puntuación IQ exacta</ProItem>
                <ProItem>Clasificación cognitiva</ProItem>
                <ProItem>Rango de percentil</ProItem>
                <ProItem>Total de respuestas correctas</ProItem>
              </ul>
            </div>

            <div className="p-7 bg-ink text-paper relative">
              <span className="absolute -top-px right-0 px-3 py-1 bg-orange text-paper text-[10px] font-mono uppercase tracking-[0.2em]">
                Plan Pro
              </span>
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/60">Suscripción</span>
                <span className="font-display text-3xl">$12<span className="text-base text-paper/60">/mes</span></span>
              </div>
              <p className="font-display text-2xl mb-5">Análisis completo</p>
              <ul className="space-y-2.5 text-paper/90">
                <ProItem dark>Todo lo del plan gratuito</ProItem>
                <ProItem dark>Percentil exacto y comparativa</ProItem>
                <ProItem dark>Análisis por área cognitiva</ProItem>
                <ProItem dark>Certificado PDF descargable</ProItem>
                <ProItem dark>Tests ilimitados con historial</ProItem>
                <ProItem dark>Acceso completo a Autodidactas</ProItem>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/iq/inicio"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.25em] hover:bg-orange transition-colors shadow-[6px_6px_0_0_var(--orange)]"
            >
              Comenzar ahora
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
          Autodidactas · Vol. I · Test de IQ
        </p>
      </footer>
    </div>
  );
}

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between px-5 py-3.5">
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">{k}</dt>
      <dd className="font-display text-xl tabular-nums">{v}</dd>
    </div>
  );
}

type Tone = "crimson" | "cobalt" | "mustard" | "sage";
const TONE_BG: Record<Tone, string> = {
  crimson: "hover:bg-orange/10",
  cobalt: "hover:bg-cobalt-soft",
  mustard: "hover:bg-mustard-soft",
  sage: "hover:bg-sage-soft",
};
const TONE_NUM: Record<Tone, string> = {
  crimson: "text-orange",
  cobalt: "text-cobalt",
  mustard: "text-mustard",
  sage: "text-sage",
};

function AreaCell({
  n,
  title,
  desc,
  tone,
  last,
}: {
  n: string;
  title: string;
  desc: string;
  tone: Tone;
  last?: boolean;
}) {
  return (
    <div
      className={`p-7 group transition-colors ${TONE_BG[tone]} ${
        !last
          ? "border-b-2 sm:border-b-2 lg:border-b-0 lg:border-r-2 border-ink last:border-r-0 sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r-2"
          : ""
      }`}
    >
      <span className={`font-mono text-[10px] uppercase tracking-[0.3em] ${TONE_NUM[tone]}`}>§ {n}</span>
      <h3 className="font-display text-3xl mt-3 tracking-tight">{title}</h3>
      <p className="text-[13px] text-ink/70 mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

function ProItem({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-[13.5px]">
      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${dark ? "text-orange" : "text-orange"}`} strokeWidth={2.5} />
      <span>{children}</span>
    </li>
  );
}
