import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, User as UserIcon, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { index: number; page: number | null; excerpt: string }[];
}

const SUGGESTED = [
  "Hacé un resumen en 3 puntos clave",
  "Explicá el concepto principal con un ejemplo",
  "¿Qué tendría que recordar para el examen?",
];

export function DocumentChat({ documentId }: { documentId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const { data, error } = await supabase.functions.invoke("chat-document", {
        body: {
          documentId,
          question,
          history: messages.map(({ role, content }) => ({ role, content })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer ?? "Sin respuesta.", sources: data.sources },
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

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-360px)] min-h-[480px]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto border-2 border-ink bg-cream/20 p-5 md:p-7 space-y-5"
      >
        {messages.length === 0 ? (
          <EmptyChat onPick={send} />
        ) : (
          messages.map((m, i) => <Bubble key={i} message={m} />)
        )}
        {sending && (
          <div className="flex items-center gap-3 text-ink/60 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-orange" />
            <span className="font-mono uppercase tracking-wider text-xs">Pensando…</span>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Preguntale al documento…"
          disabled={sending}
          className="flex-1 px-4 py-3 border-2 border-ink bg-paper text-ink placeholder-ink/40 focus:outline-none focus:bg-cream/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" strokeWidth={1.75} />
          <span className="hidden sm:inline text-sm font-medium">Enviar</span>
        </button>
      </form>
    </div>
  );
}

function EmptyChat({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="text-center py-8">
      <Sparkles className="w-8 h-8 mx-auto mb-4 text-orange" strokeWidth={1.5} />
      <p className="font-display text-xl text-ink mb-2">Conversá con tu documento</p>
      <p className="text-sm text-ink/60 mb-6">
        Pedí explicaciones, ejemplos o resúmenes. Las respuestas vienen del contenido procesado.
      </p>
      <div className="flex flex-col gap-2 max-w-md mx-auto">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-left text-sm px-4 py-3 border border-border hover:border-ink hover:bg-cream/40 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 flex items-center justify-center flex-shrink-0 border ${
          isUser ? "bg-ink text-paper border-ink" : "bg-cream/60 text-ink border-border"
        }`}
      >
        {isUser ? (
          <UserIcon className="w-4 h-4" strokeWidth={1.75} />
        ) : (
          <BookOpen className="w-4 h-4" strokeWidth={1.75} />
        )}
      </div>
      <div className={`flex-1 max-w-[85%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block text-left px-4 py-3 ${
            isUser ? "bg-ink text-paper" : "bg-paper border border-border"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-mono text-ink/50">Fuentes</p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((s) => (
                <span
                  key={s.index}
                  title={s.excerpt}
                  className="text-[11px] font-mono px-2 py-0.5 border border-border text-ink/70 bg-cream/30"
                >
                  Frag. {s.index}
                  {s.page ? ` · p.${s.page}` : ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
