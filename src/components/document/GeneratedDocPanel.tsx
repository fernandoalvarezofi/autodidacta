import { useState } from "react";
import { Loader2, BookMarked, Clock, MessageCircleQuestion, Briefcase, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SummaryRender } from "./SummaryRender";

export type GeneratedDocType = "study_guide" | "timeline" | "faq" | "business_plan";

export interface TimelineContent {
  title: string;
  events: Array<{
    date: string;
    title: string;
    description: string;
    category?: string;
  }>;
}

export interface FaqContent {
  title: string;
  items: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
}

export interface MarkdownContent {
  markdown: string;
}

export type GeneratedContent = MarkdownContent | TimelineContent | FaqContent;

interface Props {
  documentId: string;
  initialOutputs: Partial<Record<GeneratedDocType, GeneratedContent>>;
}

const DEFS: Array<{
  key: GeneratedDocType;
  label: string;
  description: string;
  icon: typeof BookMarked;
  gradient: string;
}> = [
  {
    key: "study_guide",
    label: "Guía de estudio",
    description: "Objetivos, conceptos clave y preguntas de repaso",
    icon: BookMarked,
    gradient: "from-orange/15 to-orange/5",
  },
  {
    key: "timeline",
    label: "Línea de tiempo",
    description: "Eventos ordenados cronológicamente",
    icon: Clock,
    gradient: "from-blue-500/15 to-blue-500/5",
  },
  {
    key: "faq",
    label: "Preguntas frecuentes",
    description: "Dudas anticipadas con respuestas claras",
    icon: MessageCircleQuestion,
    gradient: "from-emerald-500/15 to-emerald-500/5",
  },
  {
    key: "business_plan",
    label: "Plan de negocios",
    description: "Modelo, mercado, KPIs y go-to-market",
    icon: Briefcase,
    gradient: "from-purple-500/15 to-purple-500/5",
  },
];

export function GeneratedDocPanel({ documentId, initialOutputs }: Props) {
  const [outputs, setOutputs] =
    useState<Partial<Record<GeneratedDocType, GeneratedContent>>>(initialOutputs);
  const [loading, setLoading] = useState<GeneratedDocType | null>(null);
  const [active, setActive] = useState<GeneratedDocType | null>(null);

  const generate = async (type: GeneratedDocType) => {
    setLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("generate-output", {
        body: { documentId, type },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? "Error al generar");
      setOutputs((prev) => ({ ...prev, [type]: data.content }));
      setActive(type);
      toast.success("Documento generado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto py-8">
      <div className="max-w-4xl mx-auto px-2">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-ink/40 mb-2">
            Generador automático
          </p>
          <h2 className="font-display text-3xl text-ink mb-2">Documentos one-click</h2>
          <p className="text-sm text-ink/60">
            Generá documentos estructurados a partir de esta fuente. Cada uno se guarda
            automáticamente y podés regenerarlo cuando quieras.
          </p>
        </div>

        {/* Grid de generadores */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {DEFS.map((def) => {
            const Icon = def.icon;
            const has = !!outputs[def.key];
            const isLoading = loading === def.key;
            return (
              <button
                key={def.key}
                onClick={() => (has ? setActive(def.key) : generate(def.key))}
                disabled={!!loading}
                className={`group relative text-left border-2 border-border bg-paper p-5 rounded-lg transition-all hover:border-ink/60 hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none overflow-hidden ${
                  active === def.key ? "border-orange shadow-orange" : ""
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${def.gradient} opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="inline-flex items-center justify-center w-11 h-11 bg-paper border border-border rounded-lg shadow-sm">
                      <Icon className="w-5 h-5 text-ink" strokeWidth={1.75} />
                    </div>
                    {has && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-orange bg-orange/10 px-2 py-1 rounded border border-orange/20">
                        ✓ Listo
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-medium text-ink mb-1">{def.label}</h3>
                  <p className="text-xs text-ink/60 mb-4 leading-relaxed">{def.description}</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink/70 group-hover:text-ink">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generando...
                      </>
                    ) : has ? (
                      <>Ver documento →</>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                        Generar
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Render del activo */}
        {active && outputs[active] && (
          <div className="border-t border-border pt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl text-ink">
                {DEFS.find((d) => d.key === active)?.label}
              </h3>
              <button
                onClick={() => generate(active)}
                disabled={!!loading}
                className="text-xs font-medium text-ink/60 hover:text-ink inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading === active ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Regenerar
              </button>
            </div>
            <RenderOutput type={active} content={outputs[active]!} />
          </div>
        )}
      </div>
    </div>
  );
}

function RenderOutput({ type, content }: { type: GeneratedDocType; content: GeneratedContent }) {
  if (type === "study_guide" || type === "business_plan") {
    return (
      <article className="prose-academic">
        <SummaryRender markdown={(content as MarkdownContent).markdown} />
      </article>
    );
  }
  if (type === "timeline") {
    const tl = content as TimelineContent;
    return (
      <div>
        {tl.title && <h4 className="font-display text-xl text-ink mb-6">{tl.title}</h4>}
        <ol className="relative border-l-2 border-orange/30 pl-6 space-y-6">
          {tl.events.map((ev, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-gradient-orange shadow-orange ring-4 ring-paper" />
              <div className="text-[11px] font-mono uppercase tracking-wider text-orange mb-1">
                {ev.date}
                {ev.category && <span className="text-ink/40 ml-2">· {ev.category}</span>}
              </div>
              <h5 className="font-display text-lg text-ink mb-1">{ev.title}</h5>
              <p className="text-sm text-ink/70 leading-relaxed">{ev.description}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (type === "faq") {
    const faq = content as FaqContent;
    return (
      <div>
        {faq.title && <h4 className="font-display text-xl text-ink mb-6">{faq.title}</h4>}
        <div className="space-y-3">
          {faq.items.map((it, i) => (
            <details
              key={i}
              className="group border border-border bg-paper rounded-lg overflow-hidden hover:border-ink/40 transition-colors"
            >
              <summary className="cursor-pointer list-none p-4 flex items-start gap-3 hover:bg-cream/30 transition-colors">
                <span className="font-mono text-[11px] uppercase tracking-wider text-orange mt-1 shrink-0">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-base text-ink flex-1">{it.question}</span>
                <span className="text-ink/40 text-sm group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="px-4 pb-4 pl-[68px] text-sm text-ink/75 leading-relaxed">
                {it.answer}
                {it.category && (
                  <div className="mt-2 text-[10px] font-mono uppercase tracking-wider text-ink/40">
                    {it.category}
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
