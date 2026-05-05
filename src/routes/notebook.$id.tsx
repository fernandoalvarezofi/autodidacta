import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Files,
  MessagesSquare,
  NotebookPen,
  Sparkles,
  Plus,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SourceUploader } from "@/components/document/SourceUploader";
import { NotesList } from "@/components/editor/NotesList";
import { DocumentCard, type DocumentRow } from "@/components/notebook/DocumentCard";
import { toast } from "sonner";

export const Route = createFileRoute("/notebook/$id")({
  component: NotebookPage,
});

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  cover_color: string | null;
  created_at: string;
}

type Tab = "chat" | "documents" | "notes";

function NotebookPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [notesCount, setNotesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("documents");
  const [showUploader, setShowUploader] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const readyDocsCount = documents.filter((d) => d.status === "ready").length;

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notebook-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents", filter: `notebook_id=eq.${id}` },
        () => void loadDocuments(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  useEffect(() => {
    if (!user) return;
    const hasProcessing = documents.some((doc) =>
      ["pending", "processing", "chunked", "generating"].includes(doc.status),
    );
    if (!hasProcessing) return;

    const interval = window.setInterval(() => {
      void loadDocuments();
    }, 3000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, documents]);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    const [nbRes, docsRes, notesRes] = await Promise.all([
      supabase.from("notebooks").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("documents")
        .select("*")
        .eq("notebook_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("notebook_id", id),
    ]);
    if (nbRes.error) {
      console.error("[notebook] error cargando notebook:", nbRes.error);
      setLoadError(nbRes.error.message ?? "Error desconocido al cargar el cuaderno.");
      setLoading(false);
      return;
    }
    if (!nbRes.data) {
      setLoadError(`No se encontró el cuaderno con id ${id}. Puede haber sido eliminado o no tenés permiso para verlo.`);
      setLoading(false);
      return;
    }
    setNotebook(nbRes.data as Notebook);
    setDocuments((docsRes.data ?? []) as DocumentRow[]);
    setNotesCount(notesRes.count ?? 0);
    setLoading(false);
  };

  const loadDocuments = async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("notebook_id", id)
      .order("created_at", { ascending: false });
    setDocuments((data ?? []) as DocumentRow[]);
  };

  if (loadError) {
    return (
      <DashboardShell>
        <div className="container mx-auto max-w-2xl px-6 py-16">
          <div className="border-2 border-ink bg-paper p-8 shadow-[6px_6px_0_0_var(--color-ink)]">
            <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-orange mb-3">
              Error al abrir cuaderno
            </p>
            <h1 className="font-display text-3xl text-ink mb-4">No pudimos cargar el cuaderno</h1>
            <p className="text-sm text-ink/70 leading-relaxed mb-6 font-mono bg-cream/50 border border-border p-3 rounded">
              {loadError}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => void loadData()}
                className="px-4 py-2 text-sm font-medium border-2 border-ink bg-paper hover:bg-cream transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="px-4 py-2 text-sm font-medium bg-ink text-paper hover:bg-orange transition-colors border-2 border-ink"
              >
                Volver a la biblioteca
              </button>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (authLoading || loading || !notebook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  const wide = tab === "documents" || tab === "notes";

  // Sugerencias dinámicas según títulos de documentos
  const dynamicSuggestions = readyDocsCount > 0
    ? [
        "¿Cuáles son los temas principales de este cuaderno?",
        documents[0] ? `Resumime "${documents[0].title}" en 5 puntos` : "Resumime el contenido más reciente",
        "Generá un mapa conceptual de las ideas clave",
        "¿Qué preguntas de examen podría hacerme con este material?",
      ]
    : [];

  return (
    <DashboardShell>
      <WorkspaceLayout
        title={notebook.title}
        eyebrow="Cuaderno"
        emoji={notebook.emoji ?? "notebook"}
        subtitle={
          <div className="flex items-center gap-3 text-[11px] font-mono text-ink/45">
            <span className="inline-flex items-center gap-1">
              <Files className="w-3 h-3" strokeWidth={2} />
              {documents.length}
            </span>
            <span className="w-px h-3 bg-border" />
            <span className="inline-flex items-center gap-1">
              <NotebookPen className="w-3 h-3" strokeWidth={2} />
              {notesCount}
            </span>
            {readyDocsCount > 0 && (
              <>
                <span className="w-px h-3 bg-border" />
                <span className="inline-flex items-center gap-1 text-orange-deep">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                  {readyDocsCount} listos
                </span>
              </>
            )}
          </div>
        }
        backTo={{ to: "/dashboard", label: "Biblioteca" }}
        groups={[
          {
            label: "Contenido",
            items: [
              {
                key: "documents",
                label: "Documentos",
                icon: <Files className="w-4 h-4" strokeWidth={1.75} />,
                count: documents.length,
              },
              {
                key: "notes",
                label: "Notas",
                icon: <NotebookPen className="w-4 h-4" strokeWidth={1.75} />,
                count: notesCount || undefined,
              },
            ],
          },
          {
            items: [
              {
                key: "chat",
                label: "Chat del cuaderno",
                icon: <MessagesSquare className="w-4 h-4" strokeWidth={1.75} />,
                badge: "IA",
              },
            ],
          },
        ]}
        activeKey={tab}
        onItemSelect={(k) => setTab(k as Tab)}
        wide={wide}
      >
        {tab === "chat" && (
          <div className="h-full">
            {readyDocsCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-cream/60 border border-border rounded-xl">
                  <Sparkles className="w-7 h-7 text-orange" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-3xl font-semibold mb-3 tracking-tight">
                  Empezá agregando una fuente
                </h3>
                <p className="text-sm text-ink/60 max-w-md mb-7 leading-relaxed">
                  Subí un PDF, Word, audio o pegá un link de YouTube. En cuanto se procese vas a poder
                  conversar con tu material como con un tutor personal.
                </p>
                <button
                  onClick={() => setTab("documents")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-ink text-paper hover:bg-ink/90 transition-all active:scale-[0.98] rounded-md shadow-soft hover:shadow-elevated"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Agregar primera fuente
                </button>
              </div>
            ) : (
              <ChatPanel
                scope="notebook"
                contextId={id}
                variant="fullheight"
                suggestions={dynamicSuggestions}
              />
            )}
          </div>
        )}

        {tab === "documents" && (
          <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-8 animate-fade-up">
            {/* Header con CTA destacado */}
            <div className="flex items-end justify-between mb-6 gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Fuentes
                </h2>
                <p className="text-xs text-ink/55 mt-1">
                  {documents.length === 0
                    ? "Subí material para empezar a estudiar"
                    : `${documents.length} ${documents.length === 1 ? "fuente" : "fuentes"} en este cuaderno`}
                </p>
              </div>
              <button
                onClick={() => setShowUploader((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-ink text-paper hover:bg-ink/90 transition-all active:scale-[0.98] rounded-md shadow-soft"
              >
                {showUploader ? (
                  <>
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                    Cerrar
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    Agregar fuente
                  </>
                )}
              </button>
            </div>

            {/* Uploader colapsable */}
            {(showUploader || documents.length === 0) && (
              <div className="mb-8 animate-fade-up">
                <SourceUploader
                  notebookId={id}
                  onUploaded={() => {
                    void loadDocuments();
                    setShowUploader(false);
                  }}
                />
              </div>
            )}

            {documents.length === 0 ? (
              <div className="border-2 border-dashed border-border py-14 text-center bg-cream/20 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-paper border border-border rounded-md">
                  <FileText className="w-5 h-5 text-ink/40" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-ink/60 max-w-sm mx-auto">
                  Cargá tu primer PDF, Word, audio o link de video arriba.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} onChange={loadDocuments} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-8 animate-fade-up">
            <NotesList notebookId={id} />
          </div>
        )}
      </WorkspaceLayout>
    </DashboardShell>
  );
}
