import { useEffect, useRef, useState, useCallback, Fragment, useMemo } from "react";
import {
  Send,
  Loader2,
  Sparkles,
  User as UserIcon,
  BookOpen,
  Globe2,
  Brain,
  Square,
  PanelLeft,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { ChatSessionsSidebar } from "./ChatSessionsSidebar";
import { ChatModeSelector } from "./ChatModeSelector";
import { SourcePanel } from "./SourcePanel";
import { streamChat, type ChatStreamSource } from "@/lib/chat-stream";
import {
  type ChatMode,
  type ChatScope,
  type ChatSession,
  autoTitleFromQuestion,
  createSession,
  listMessages,
  listSessions,
  renameSession,
  updateSessionMode,
} from "@/lib/chat-sessions";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatStreamSource[];
  usedGeneralKnowledge?: boolean;
  streaming?: boolean;
}

interface ChatPanelProps {
  scope: ChatScope;
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
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load or create initial session
  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const sessions = await listSessions(scope, contextId);
        if (sessions.length > 0) {
          await selectSession(sessions[0]);
        } else {
          const fresh = await createSession({
            userId: user.id,
            scope,
            contextId,
            title: "Nueva conversación",
          });
          await selectSession(fresh);
          setSidebarRefreshKey((k) => k + 1);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al iniciar el chat");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, contextId, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const selectSession = useCallback(async (s: ChatSession) => {
    setActiveSession(s);
    setLoadingMessages(true);
    try {
      const rows = await listMessages(s.id);
      setMessages(
        rows
          .filter((r) => r.role === "user" || r.role === "assistant")
          .map((r) => ({
            id: r.id,
            role: r.role as "user" | "assistant",
            content: r.content,
            sources: Array.isArray(r.citations) ? (r.citations as ChatStreamSource[]) : undefined,
          })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar mensajes");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const handleNewSession = (s: ChatSession) => {
    void selectSession(s);
  };

  const toggleMode = async () => {
    if (!activeSession) return;
    const next: ChatMode = activeSession.mode === "normal" ? "socratic" : "normal";
    try {
      await updateSessionMode(activeSession.id, next);
      setActiveSession({ ...activeSession, mode: next });
      toast.success(next === "socratic" ? "Modo Socrático activado" : "Modo normal activado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSending(false);
  };

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || sending || !activeSession || !user) return;
    setInput("");

    // Optimistic user message + placeholder assistant
    const userMsg: ChatMessage = { role: "user", content: question };
    const assistantPlaceholder: ChatMessage = {
      role: "assistant",
      content: "",
      streaming: true,
    };
    setMessages((m) => [...m, userMsg, assistantPlaceholder]);
    setSending(true);

    // Auto-title for sessions with default name
    const isDefaultTitle = /^(nueva conversaci[oó]n|conversaci[oó]n)$/i.test(activeSession.title);
    if (isDefaultTitle && messages.length === 0) {
      const newTitle = autoTitleFromQuestion(question);
      void renameSession(activeSession.id, newTitle).then(() => {
        setActiveSession((s) => (s ? { ...s, title: newTitle } : s));
        setSidebarRefreshKey((k) => k + 1);
      });
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await streamChat(
        scope,
        {
          contextId,
          sessionId: activeSession.id,
          question,
          mode: activeSession.mode,
        },
        {
          onMeta: (sources, usedGeneralKnowledge) => {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                copy[copy.length - 1] = { ...last, sources, usedGeneralKnowledge };
              }
              return copy;
            });
          },
          onDelta: (chunk) => {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                copy[copy.length - 1] = { ...last, content: last.content + chunk };
              }
              return copy;
            });
          },
          onDone: () => {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                copy[copy.length - 1] = { ...last, streaming: false };
              }
              return copy;
            });
            setSending(false);
            abortRef.current = null;
            setSidebarRefreshKey((k) => k + 1);
          },
          onError: (msg) => {
            toast.error(msg);
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant" && !last.content) {
                copy[copy.length - 1] = {
                  ...last,
                  content: "Hubo un error procesando tu pregunta. Probá de nuevo.",
                  streaming: false,
                };
              } else if (last && last.role === "assistant") {
                copy[copy.length - 1] = { ...last, streaming: false };
              }
              return copy;
            });
            setSending(false);
            abortRef.current = null;
          },
        },
        ctrl.signal,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en el chat");
      setSending(false);
      abortRef.current = null;
    }
  };

  const padded = compact ? "p-4" : "p-6";
  const gap = compact ? "space-y-4" : "space-y-5";
  const isSocratic = activeSession?.mode === "socratic";

  return (
    <div className="relative flex flex-col h-full min-h-0">
      {/* Drawer overlay de conversaciones */}
      {sidebarOpen && (
        <>
          <div
            className="absolute inset-0 z-20 bg-ink/20 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 z-30 w-72 max-w-[85%] animate-slide-in-up">
            <div className="h-full flex flex-col bg-paper border border-border rounded-lg shadow-soft overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink/60">
                  Conversaciones
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-ink/50 hover:text-ink hover:bg-cream rounded-sm transition-colors"
                  title="Cerrar"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatSessionsSidebar
                  scope={scope}
                  contextId={contextId}
                  activeSessionId={activeSession?.id ?? null}
                  onSelect={(s) => {
                    void selectSession(s);
                    setSidebarOpen(false);
                  }}
                  onCreated={(s) => {
                    handleNewSession(s);
                    setSidebarOpen(false);
                  }}
                  refreshKey={sidebarRefreshKey}
                  embedded
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        {/* Header con toggle sidebar + título de sesión + toggle modo */}
        {activeSession && (
          <div className="flex items-center justify-between gap-3 mb-2 px-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-ink/70 hover:text-ink hover:bg-cream rounded-md transition-colors flex-shrink-0"
                title="Ver conversaciones"
              >
                <PanelLeft className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="hidden sm:inline">Historial</span>
              </button>
              <div className="w-px h-4 bg-border flex-shrink-0" />
              <h3 className="font-display text-base font-semibold text-ink truncate">
                {activeSession.title}
              </h3>
            </div>
            <button
              onClick={toggleMode}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md border transition-all flex-shrink-0 ${
                isSocratic
                  ? "bg-orange/10 border-orange/40 text-orange-deep hover:bg-orange/20"
                  : "bg-paper border-border text-ink/70 hover:border-ink hover:text-ink"
              }`}
              title="Cambiar entre modo normal y socrático"
            >
              {isSocratic ? (
                <>
                  <Brain className="w-3.5 h-3.5" strokeWidth={2} />
                  Socrático
                </>
              ) : (
                <>
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                  Normal
                </>
              )}
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          className={`flex-1 overflow-y-auto bg-cream/30 border border-border rounded-lg ${padded} ${gap} relative`}
          style={{ backgroundImage: "var(--gradient-radial-orange)" }}
        >
          {intro && messages.length === 0 && <div className="mb-2">{intro}</div>}
          {loadingMessages ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-ink/40" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyChat
              onPick={send}
              suggestions={isSocratic ? SOCRATIC_SUGGESTIONS : suggestions}
              isSocratic={isSocratic}
              scope={scope}
            />
          ) : (
            messages.map((m, i) => <Bubble key={m.id ?? i} message={m} compact={compact} />)
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="mt-3 flex gap-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isSocratic
                  ? "Escribí tu duda — te voy a guiar con preguntas…"
                  : scope === "document"
                    ? "Preguntale al documento…"
                    : "Preguntale al cuaderno…"
              }
              disabled={sending || !activeSession}
              className={`w-full ${compact ? "px-3.5 py-2.5 text-sm" : "px-4 py-3.5"} bg-paper border border-border focus:border-ink placeholder-ink/40 focus:outline-none transition-colors disabled:opacity-50 shadow-soft rounded-md`}
            />
          </div>
          {sending ? (
            <button
              type="button"
              onClick={stopStreaming}
              className={`inline-flex items-center gap-2 ${compact ? "px-3.5 py-2.5" : "px-5 py-3.5"} bg-destructive/90 text-paper hover:bg-destructive transition-all active:scale-[0.98] rounded-md`}
              title="Detener generación"
            >
              <Square className="w-4 h-4 fill-current" strokeWidth={1.75} />
              {!compact && <span className="hidden sm:inline text-sm font-medium">Detener</span>}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || !activeSession}
              className={`inline-flex items-center gap-2 ${compact ? "px-3.5 py-2.5" : "px-5 py-3.5"} bg-gradient-ink text-paper hover:shadow-orange transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.98] rounded-md`}
            >
              <Send className="w-4 h-4" strokeWidth={1.75} />
              {!compact && <span className="hidden sm:inline text-sm font-medium">Enviar</span>}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

const SOCRATIC_SUGGESTIONS = [
  "No entiendo el concepto principal, ¿podés guiarme?",
  "¿Cómo aplicaría esto a un caso real?",
  "Tengo dudas con la parte X — ayudame a pensarlo",
  "¿Qué relación hay entre los conceptos?",
];

function EmptyChat({
  onPick,
  suggestions,
  isSocratic,
  scope,
}: {
  onPick: (q: string) => void;
  suggestions: string[];
  isSocratic: boolean;
  scope: ChatScope;
}) {
  return (
    <div className="text-center py-6 animate-fade-in">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full animate-pulse-glow ${
          isSocratic ? "bg-gradient-orange shadow-orange" : "bg-gradient-ink shadow-ink"
        }`}
      >
        {isSocratic ? (
          <Brain className="w-5 h-5 text-paper" strokeWidth={1.75} />
        ) : (
          <Sparkles className="w-5 h-5 text-paper" strokeWidth={1.75} />
        )}
      </div>
      <p className="font-display text-xl text-ink mb-2">
        {isSocratic
          ? "Modo Socrático activado"
          : scope === "document"
            ? "Conversá con tu documento"
            : "Conversá con tu cuaderno"}
      </p>
      <p className="text-sm text-ink/60 mb-6 max-w-md mx-auto leading-relaxed">
        {isSocratic
          ? "No te voy a dar respuestas directas. Te voy a hacer preguntas que te lleven a deducir vos mismo. Probá con una duda real."
          : scope === "document"
            ? "Pedí explicaciones, ejemplos, contexto adicional. Si la respuesta no está en el documento, te ayudo con conocimiento general."
            : "Hago búsqueda en todos los documentos del cuaderno y completo con contexto general cuando hace falta."}
      </p>
      <div className="flex flex-col gap-2 max-w-md mx-auto stagger">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-left text-sm px-4 py-3 bg-paper border border-border hover:border-ink hover:shadow-soft transition-all hover:-translate-y-0.5 group rounded-md"
          >
            <span className="text-ink/80 group-hover:text-ink transition-colors">{s}</span>
          </button>
        ))}
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
              {message.content ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                <ThinkingDots />
              )}
              {message.streaming && message.content && (
                <span className="inline-block w-1.5 h-3.5 bg-orange align-middle ml-0.5 animate-pulse" />
              )}
            </div>
          )}
        </div>
        {!isUser &&
          !message.streaming &&
          (message.usedGeneralKnowledge || (message.sources && message.sources.length > 0)) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {message.usedGeneralKnowledge && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono px-2 py-1 bg-orange/10 text-orange-deep border border-orange/30 rounded-sm">
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
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-cream border border-border text-ink/70 hover:border-ink hover:text-ink transition-colors cursor-help rounded-sm"
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

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
