import { useEffect, useState } from "react";
import { Plus, MessageSquare, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import {
  type ChatScope,
  type ChatSession,
  listSessions,
  createSession,
  deleteSession,
  renameSession,
} from "@/lib/chat-sessions";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface Props {
  scope: ChatScope;
  contextId: string;
  activeSessionId: string | null;
  onSelect: (session: ChatSession) => void;
  onCreated: (session: ChatSession) => void;
  refreshKey?: number;
}

export function ChatSessionsSidebar({
  scope,
  contextId,
  activeSessionId,
  onSelect,
  onCreated,
  refreshKey = 0,
}: Props) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, contextId, refreshKey]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listSessions(scope, contextId);
      setSessions(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar conversaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleNew = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const s = await createSession({
        userId: user.id,
        scope,
        contextId,
        title: "Nueva conversación",
      });
      setSessions((prev) => [s, ...prev]);
      onCreated(s);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta conversación?")) return;
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        const next = sessions.find((s) => s.id !== id);
        if (next) onSelect(next);
      }
      toast.success("Conversación eliminada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  const startEdit = (s: ChatSession) => {
    setEditingId(s.id);
    setEditValue(s.title);
  };

  const commitEdit = async () => {
    if (!editingId) return;
    const id = editingId;
    const title = editValue.trim() || "Conversación";
    try {
      await renameSession(id, title);
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
      setEditingId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al renombrar");
    }
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col bg-paper border border-border rounded-lg overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink/60">
          Conversaciones
        </h3>
        <button
          onClick={handleNew}
          disabled={creating}
          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all rounded-md disabled:opacity-50"
          title="Nueva conversación"
        >
          {creating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Plus className="w-3 h-3" strokeWidth={2.5} />
          )}
          Nueva
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-ink/40" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 px-3">
            <MessageSquare className="w-5 h-5 text-ink/30 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-xs text-ink/50">Sin conversaciones todavía</p>
            <button
              onClick={handleNew}
              className="mt-3 text-xs text-orange-deep hover:text-orange transition-colors font-medium"
            >
              Empezá la primera →
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {sessions.map((s) => {
              const active = s.id === activeSessionId;
              const editing = s.id === editingId;
              return (
                <li
                  key={s.id}
                  className={`group relative transition-colors ${
                    active ? "bg-cream/60" : "hover:bg-cream/30"
                  }`}
                >
                  <div className="flex items-start gap-2 p-3">
                    <div
                      className={`mt-1 w-1 h-6 rounded-full transition-all ${
                        active ? "bg-gradient-orange" : "bg-transparent"
                      }`}
                    />
                    {editing ? (
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void commitEdit();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="flex-1 text-sm bg-paper border border-ink/40 px-2 py-1 rounded-sm focus:outline-none"
                        />
                        <button
                          onClick={commitEdit}
                          className="p-1 text-orange-deep hover:bg-orange/10 rounded-sm"
                        >
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-ink/40 hover:bg-ink/5 rounded-sm"
                        >
                          <X className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelect(s)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p
                          className={`text-sm truncate leading-tight ${
                            active ? "text-ink font-medium" : "text-ink/80"
                          }`}
                        >
                          {s.title}
                        </p>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-ink/40 mt-1">
                          {s.message_count} msj
                          {s.mode === "socratic" ? " · socrático" : ""}
                          {" · "}
                          {relativeShort(s.last_message_at)}
                        </p>
                      </button>
                    )}

                    {!editing && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(s)}
                          className="p-1 text-ink/40 hover:text-ink hover:bg-cream rounded-sm"
                          title="Renombrar"
                        >
                          <Pencil className="w-3 h-3" strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1 text-ink/40 hover:text-destructive hover:bg-destructive/5 rounded-sm"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" strokeWidth={1.75} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

function relativeShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short" });
}
