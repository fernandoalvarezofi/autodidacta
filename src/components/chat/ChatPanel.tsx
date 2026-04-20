import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, User as UserIcon, BookOpen, Globe2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatSource {
  index: number;
  page: number | null;
  excerpt: string;
  documentId?: string;
  documentTitle?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  usedGeneralKnowledge?: boolean;
}

interface ChatPanelProps {
  scope: "document" | "notebook";
  contextId: string;
  suggestions?: string[];
  compact?: boolean;
  intro?: React.ReactNode;
}

const DEFAULT_SUGGESTIONS = [
  "Hacé un resumen en 3 puntos clave",
  "Explicá el concepto principal con un ejemplo de la vida real",
  "¿Qué tendría que recordar para el examen?",
  "Dame contexto general sobre este tema",
];

export function ChatPanel({
  scope,
  contextId,
  suggestions = DEFAULT_SUGGESTIONS,
  compact = false,
  intro,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [scope, contextId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || sending) return;
    setInput("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setSending(true);
    try {
      const fn = scope === "document" ? "chat-document" : "chat-notebook";
      const body =
        scope === "document"
          ? { documentId: contextId, question, history: messages.map(({ role, content }) => ({ role, content })) }
          : { notebookId: contextId, question, history: messages.map(({ role, content }) => ({ role, content })) };

      const { data, error } = await supabase.functions.invoke(fn, { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.answer ?? "Sin respuesta.",
          sources: data.sources,
          usedGeneralKnowledge: data.usedGeneralKnowledge,
        },
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en el chat");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Hubo un error procesando tu pregunta. Probá de nuevo en un momento.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const padded = compact ? "p-4" : "p-6 md:p-8";
  const gap = compact ? "space-y-4" : "space-y-6";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto bg-cream/30 border border-border ${padded} ${gap} relative`}
        style={{
          backgroundImage: "var(--gradient-radial-orange)",
        }}
      >
        {intro && messages.length === 0 && <div className="mb-2">{intro}</div>}
        {messages.length === 0 ? (
          <EmptyChat
            onPick={send}
            suggestions={suggestions}
            label={scope === "document" ? "Conversá con tu documento" : "Conversá con tu cuaderno"}
            sublabel={
              scope === "document"
                ? "Pedí explicaciones, ejemplos, contexto adicional. Si la respuesta no está en el documento, te ayudo con conocimiento general."
                : "Hago búsqueda en todos los documentos del cuaderno y completo con contexto general cuando hace falta."
            }
          />
        ) : (
          messages.map((m, i) => <Bubble key={i} message={m} compact={compact} />)
        )}
        {sending && <ThinkingBubble />}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="mt-3 flex gap-2"
      >
        <div className="flex-1 relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              scope === "document" ? "Preguntale al documento…" : "Preguntale al cuaderno…"
            }
            disabled={sending}
            className={`w-full ${compact ? "px-3.5 py-2.5 text-sm" : "px-4 py-3.5"} bg-paper border border-border focus:border-ink placeholder-ink/40 focus:outline-none transition-colors disabled:opacity-50 shadow-soft`}
          />
        </div>
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className={`inline-flex items-center gap-2 ${compact ? "px-3.5 py-2.5" : "px-5 py-3.5"} bg-gradient-ink text-paper hover:shadow-orange transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.98]`}
        >
          <Send className="w-4 h-4" strokeWidth={1.75} />
          {!compact && <span className="hidden sm:inline text-sm font-medium">Enviar</span>}
        </button>
      </form>
    </div>
  );
}

function EmptyChat({
  onPick,
  suggestions,
  label,
  sublabel,
}: {
  onPick: (q: string) => void;
  suggestions: string[];
  label: string;
  sublabel: string;
}) {
  return (
    <div className="text-center py-6 animate-fade-in">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gradient-orange shadow-orange rounded-full animate-pulse-glow">
        <Sparkles className="w-5 h-5 text-paper" strokeWidth={1.75} />
      </div>
      <p className="font-display text-xl text-ink mb-2">{label}</p>
      <p className="text-sm text-ink/60 mb-6 max-w-md mx-auto leading-relaxed">{sublabel}</p>
      <div className="flex flex-col gap-2 max-w-md mx-auto stagger">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-left text-sm px-4 py-3 bg-paper border border-border hover:border-ink hover:shadow-soft transition-all hover:-translate-y-0.5 group"
          >
            <span className="text-ink/80 group-hover:text-ink transition-colors">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-gradient-orange rounded-full shadow-orange">
        <Sparkles className="w-4 h-4 text-paper" strokeWidth={1.75} />
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-3 bg-paper border border-border rounded-sm">
        <span className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        <span className="ml-2 text-xs font-mono uppercase tracking-wider text-ink/50">Pensando</span>
      </div>
    </div>
  );
}

function Bubble({ message, compact }: { message: ChatMessage; compact: boolean }) {
  const isUser = message.role === "user";
  const size = compact ? "w-8 h-8" : "w-9 h-9";
  return (
    <div className={`flex gap-3 animate-slide-in-up ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`${size} flex items-center justify-center flex-shrink-0 rounded-full shadow-soft ${
          isUser ? "bg-gradient-ink text-paper" : "bg-gradient-orange text-paper"
        }`}
      >
        {isUser ? (
          <UserIcon className="w-4 h-4" strokeWidth={1.75} />
        ) : (
          <Sparkles className="w-4 h-4" strokeWidth={1.75} />
        )}
      </div>
      <div className={`flex-1 max-w-[88%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block text-left px-4 py-3 shadow-soft ${
            isUser
              ? "bg-gradient-ink text-paper rounded-tr-sm rounded-tl-2xl rounded-bl-2xl rounded-br-2xl"
              : "bg-paper border border-border rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl"
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="chat-markdown text-sm leading-relaxed text-ink">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (message.usedGeneralKnowledge || (message.sources && message.sources.length > 0)) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {message.usedGeneralKnowledge && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono px-2 py-1 bg-orange/10 text-orange-deep border border-orange/30">
                <Globe2 className="w-3 h-3" strokeWidth={2} />
                Conocimiento general
              </span>
            )}
            {message.sources && message.sources.length > 0 && (
              <>
                <span className="text-[10px] uppercase tracking-wider font-mono text-ink/40 mr-0.5">
                  Fuentes
                </span>
                {message.sources.map((s) => (
                  <span
                    key={s.index}
                    title={`${s.documentTitle ? s.documentTitle + " · " : ""}${s.excerpt}`}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-cream border border-border text-ink/70 hover:border-ink hover:text-ink transition-colors cursor-help"
                  >
                    <BookOpen className="w-2.5 h-2.5" strokeWidth={2} />
                    {s.index}
                    {s.documentTitle ? ` · ${truncate(s.documentTitle, 18)}` : ""}
                    {s.page ? ` · p.${s.page}` : ""}
                  </span>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
