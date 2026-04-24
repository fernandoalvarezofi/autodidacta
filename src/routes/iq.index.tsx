import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Calculator,
  Shapes,
  BookText,
  Check,
  Sparkles,
  Crown,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { NeuralBackground } from "@/components/NeuralBackground";

export const Route = createFileRoute("/iq/")({
  head: () => ({
    meta: [
      { title: "Test de IQ — Autodidactas" },
      {
        name: "description",
        content:
          "Evaluación cognitiva científica gratuita: 60 preguntas que miden razonamiento lógico, numérico, espacial y verbal. Sin registro previo.",
      },
      { property: "og:title", content: "Test de IQ — Autodidactas" },
      {
        property: "og:description",
        content:
          "60 preguntas estandarizadas. Descubrí cómo funciona tu mente en 20 minutos.",
      },
    ],
  }),
  component: IQLanding,
});

function IQLanding() {
  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <NeuralBackground />
      <Navbar />

      <main className="container mx-auto px-6 lg:px-10 max-w-[1100px]">
        <section className="pt-16 pb-20 lg:pt-24 lg:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] bg-cream/60 border border-border rounded-full backdrop-blur-sm mb-8">
            <Sparkles className="w-3 h-3 text-orange" strokeWidth={2.5} />
            <span className="text-ink/80">Evaluación cognitiva científica</span>
          </div>

          <h1
            className="font-display font-semibold leading-[0.98] tracking-[-0.035em] max-w-3xl mx-auto"
            style={{ fontSize: "clamp(2.5rem, 6.5vw, 5rem)" }}
          >
            Descubrí cómo
            <br />
            <span className="bg-gradient-to-br from-ink via-ink to-orange/80 bg-clip-text text-transparent">
              funciona tu mente.
            </span>
          </h1>

          <p className="mt-7 text-[17px] lg:text-lg text-ink/65 max-w-[60ch] mx-auto leading-relaxed">
            60 preguntas estandarizadas que miden tu razonamiento lógico, numérico,
            espacial y verbal. Gratuito. Sin registro previo.
          </p>

          <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-ink/70">
            <Stat value="60" label="preguntas" />
            <Sep />
            <Stat value="4" label="áreas" />
            <Sep />
            <Stat value="~20 min" label="duración" />
            <Sep />
            <Stat value="55–160" label="rango IQ" />
          </dl>

          <div className="mt-10">
            <Link
              to="/iq/inicio"
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-paper text-[14px] font-medium hover:bg-orange transition-colors rounded-md shadow-soft"
            >
              Comenzar test gratuito
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>
        </section>

        <section className="pb-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl lg:text-4xl tracking-tight">
              Cuatro áreas, un panorama completo
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AreaCard
              icon={<Brain className="w-5 h-5" strokeWidth={2} />}
              title="Lógica"
              desc="Deducción, secuencias, analogías"
            />
            <AreaCard
              icon={<Calculator className="w-5 h-5" strokeWidth={2} />}
              title="Numérico"
              desc="Series, aritmética, álgebra"
            />
            <AreaCard
              icon={<Shapes className="w-5 h-5" strokeWidth={2} />}
              title="Espacial"
              desc="Rotaciones, simetrías, patrones"
            />
            <AreaCard
              icon={<BookText className="w-5 h-5" strokeWidth={2} />}
              title="Verbal"
              desc="Sinónimos, analogías, comprensión"
            />
          </div>
        </section>

        <section className="pb-24">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl lg:text-4xl tracking-tight">
              ¿Qué incluye el resultado?
            </h2>
            <p className="text-ink/60 mt-3 text-[15px]">
              Mirá la diferencia entre la versión gratuita y el plan Pro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <div className="rounded-xl border border-border bg-paper/80 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink/45">
                  Gratis
                </span>
                <span className="text-[11px] text-ink/45">$0</span>
              </div>
              <p className="font-display text-2xl mb-4">Resultado básico</p>
              <ul className="space-y-2 text-[13.5px] text-ink/80">
                <ProItem>Puntuación IQ exacta</ProItem>
                <ProItem>Clasificación cognitiva</ProItem>
                <ProItem>Rango aproximado de percentil</ProItem>
                <ProItem>Total de respuestas correctas</ProItem>
              </ul>
            </div>

            <div className="rounded-xl border-2 border-orange bg-paper p-6 shadow-orange relative">
              <span className="absolute -top-3 left-6 inline-flex items-center gap-1 px-2 py-0.5 bg-orange text-paper text-[10px] font-mono uppercase tracking-wider rounded">
                <Crown className="w-3 h-3" strokeWidth={2.5} /> Plan Pro
              </span>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-orange">
                  Suscripción
                </span>
                <span className="text-[11px] text-ink/60">
                  <span className="font-semibold text-ink">$12</span> USD/mes
                </span>
              </div>
              <p className="font-display text-2xl mb-4">Análisis completo</p>
              <ul className="space-y-2 text-[13.5px] text-ink/80">
                <ProItem>Todo lo del plan gratuito</ProItem>
                <ProItem>Percentil exacto y comparativa global</ProItem>
                <ProItem>Análisis detallado por área cognitiva</ProItem>
                <ProItem>Certificado PDF descargable</ProItem>
                <ProItem>Tests ilimitados con historial</ProItem>
                <ProItem>Acceso completo a Autodidactas</ProItem>
              </ul>
              <p className="mt-4 text-[11.5px] text-ink/50">
                Renovación automática mensual · cancelá cuando quieras.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/iq/inicio"
              className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper text-[14px] font-medium hover:bg-orange transition-colors rounded-md"
            >
              Comenzar ahora
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="font-display text-xl font-semibold text-ink">{value}</span>
      <span className="ml-1.5 text-ink/50">{label}</span>
    </div>
  );
}

function Sep() {
  return <span className="hidden sm:inline-block w-px h-5 bg-border" />;
}

function AreaCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-paper/80 backdrop-blur-sm p-5 hover:border-ink/40 transition-colors">
      <div className="w-9 h-9 rounded-md bg-cream inline-flex items-center justify-center text-orange mb-3">
        {icon}
      </div>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="text-[13px] text-ink/60 mt-1.5">{desc}</p>
    </div>
  );
}

function ProItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" strokeWidth={2.5} />
      <span>{children}</span>
    </li>
  );
}