import { useEffect, useMemo, useState } from "react";
import { MessagesSquare, X, ChevronDown, BookMarked, FileText } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { ChatPanel } from "./ChatPanel";

interface NotebookOpt {
  id: string;
  title: string;
  emoji: string | null;
}

interface DocumentOpt {
  id: string;
  title: string;
  notebook_id: string;
  status: string;
}

type Scope = "document" | "notebook";

interface Selection {
  scope: Scope;
  id: string;
  label: string;
}

export function FloatingChat() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notebooks, setNotebooks] = useState<NotebookOpt[]>([]);
  const [documents, setDocuments] = useState<DocumentOpt[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Hide on auth & landing routes
  const hidden =
    !user ||
    location.pathname === "/" ||
    location.pathname.startsWith("/auth");

  // Load options (notebooks + ready documents)
  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [nbRes, docsRes] = await Promise.all([
        supabase
          .from("notebooks")
          .select("id, title, emoji")
          .order("updated_at", { ascending: false }),
        supabase
          .from("documents")
          .select("id, title, notebook_id, status")
          .eq("status", "ready")
          .order("created_at", { ascending: false }),
      ]);
      setNotebooks((nbRes.data ?? []) as NotebookOpt[]);
      setDocuments((docsRes.data ?? []) as DocumentOpt[]);
    })();
  }, [user, open]);

  // Auto-select context based on current route
  const routeContext = useRouteContext();
  useEffect(() => {
    if (!routeContext) return;
    if (routeContext.scope === "document") {
      const doc = documents.find((d) => d.id === routeContext.id);
      if (doc) {
        setSelection({ scope: "document", id: doc.id, label: doc.title });
        return;
      }
    }
    if (routeContext.scope === "notebook") {
      const nb = notebooks.find((n) => n.id === routeContext.id);
      if (nb) {
        setSelection({ scope: "notebook", id: nb.id, label: nb.title });
        return;
      }
    }
  }, [routeContext?.scope, routeContext?.id, documents, notebooks]);

  // Default selection if nothing chosen yet
  useEffect(() => {
    if (selection || (!notebooks.length && !documents.length)) return;
    if (notebooks[0]) {
      setSelection({ scope: "notebook", id: notebooks[0].id, label: notebooks[0].title });
    }
  }, [selection, notebooks, documents]);

  if (hidden) return null;

  return (
    <>
      {/* Trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 pl-4 pr-5 py-3.5 bg-gradient-ink text-paper hover:shadow-orange transition-all shadow-ink rounded-full animate-fade-in active:scale-95"
          aria-label="Abrir chat"
        >
          <span className="relative flex">
            <span className="absolute inset-0 rounded-full bg-orange/40 animate-ping" />
            <MessagesSquare className="w-4 h-4 relative" strokeWidth={2} />
          </span>
          <span className="text-sm font-medium tracking-wide">Chat con tu material</span>
        </button>
      )}

      {/* Side panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:bg-ink/10 md:backdrop-blur-0 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed top-0 right-0 z-50 h-screen w-full md:w-[440px] bg-paper border-l border-ink/20 flex flex-col shadow-elevated animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0 bg-gradient-warm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 inline-flex items-center justify-center bg-gradient-orange rounded-full shadow-orange">
                  <MessagesSquare className="w-4 h-4 text-paper" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-display text-base font-semibold leading-tight">Chat</p>
                  <p className="text-[10px] uppercase tracking-wider font-mono text-ink/50">
                    Asistente de estudio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-ink/60 hover:text-ink hover:bg-cream/60 transition-colors rounded-sm"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <div className="px-5 pt-3 pb-2 flex-shrink-0 relative">
              <p className="text-[10px] uppercase tracking-wider font-mono text-ink/50 mb-1.5">
                Contexto
              </p>
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 border-2 border-ink bg-cream/30 hover:bg-cream/50 transition-colors text-left"
              >
                <span className="flex items-center gap-2 min-w-0">
                  {selection?.scope === "document" ? (
                    <FileText className="w-4 h-4 text-ink/60 flex-shrink-0" strokeWidth={1.75} />
                  ) : (
                    <BookMarked className="w-4 h-4 text-orange flex-shrink-0" strokeWidth={1.75} />
                  )}
                  <span className="text-sm truncate">
                    {selection?.label ?? "Elegí un cuaderno o documento"}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 text-ink/60 flex-shrink-0" strokeWidth={1.75} />
              </button>

              {pickerOpen && (
                <ContextPicker
                  notebooks={notebooks}
                  documents={documents}
                  current={selection}
                  onPick={(s) => {
                    setSelection(s);
                    setPickerOpen(false);
                  }}
                  onClose={() => setPickerOpen(false)}
                />
              )}
            </div>

            <div className="flex-1 min-h-0 px-5 pb-5 pt-2">
              {selection ? (
                <ChatPanel
                  key={`${selection.scope}-${selection.id}`}
                  scope={selection.scope}
                  contextId={selection.id}
                  compact
                />
              ) : (
                <div className="h-full flex items-center justify-center text-center text-sm text-ink/50 border-2 border-dashed border-border p-6">
                  Subí un PDF en algún cuaderno para empezar a chatear con tu material.
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function ContextPicker({
  notebooks,
  documents,
  current,
  onPick,
  onClose,
}: {
  notebooks: NotebookOpt[];
  documents: DocumentOpt[];
  current: Selection | null;
  onPick: (s: Selection) => void;
  onClose: () => void;
}) {
  const docsByNotebook = useMemo(() => {
    const map = new Map<string, DocumentOpt[]>();
    for (const d of documents) {
      if (!map.has(d.notebook_id)) map.set(d.notebook_id, []);
      map.get(d.notebook_id)!.push(d);
    }
    return map;
  }, [documents]);

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute left-5 right-5 mt-1 z-20 bg-paper border-2 border-ink max-h-[55vh] overflow-y-auto shadow-lg">
        {notebooks.length === 0 ? (
          <div className="p-4 text-sm text-ink/50">No tenés cuadernos todavía.</div>
        ) : (
          notebooks.map((nb) => {
            const docs = docsByNotebook.get(nb.id) ?? [];
            const isCurrentNb = current?.scope === "notebook" && current.id === nb.id;
            return (
              <div key={nb.id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => onPick({ scope: "notebook", id: nb.id, label: nb.title })}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-cream/40 transition-colors ${
                    isCurrentNb ? "bg-cream/60" : ""
                  }`}
                >
                  <BookMarked className="w-4 h-4 text-orange flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-sm font-medium truncate flex-1">{nb.title}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink/40">
                    Cuaderno
                  </span>
                </button>
                {docs.length > 0 && (
                  <div className="pl-3">
                    {docs.map((d) => {
                      const isCurrentDoc =
                        current?.scope === "document" && current.id === d.id;
                      return (
                        <button
                          key={d.id}
                          onClick={() =>
                            onPick({ scope: "document", id: d.id, label: d.title })
                          }
                          className={`w-full flex items-center gap-2 pl-5 pr-3 py-2 text-left hover:bg-cream/40 transition-colors border-l border-border ml-3 ${
                            isCurrentDoc ? "bg-cream/60" : ""
                          }`}
                        >
                          <FileText
                            className="w-3.5 h-3.5 text-ink/60 flex-shrink-0"
                            strokeWidth={1.75}
                          />
                          <span className="text-xs truncate text-ink/80">{d.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

/**
 * Detect the current route to default the chat context.
 * We can't call useParams unconditionally for a route the user isn't on,
 * so we parse pathname instead.
 */
function useRouteContext(): { scope: Scope; id: string } | null {
  const location = useLocation();
  const docMatch = location.pathname.match(/^\/document\/([^/]+)/);
  if (docMatch) return { scope: "document", id: docMatch[1] };
  const nbMatch = location.pathname.match(/^\/notebook\/([^/]+)/);
  if (nbMatch) return { scope: "notebook", id: nbMatch[1] };
  return null;
}
