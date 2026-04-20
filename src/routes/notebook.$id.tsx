import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Files,
  MessagesSquare,
  NotebookPen,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SourceUploader } from "@/components/document/SourceUploader";
import { NotesList } from "@/components/editor/NotesList";
import { NotebookHero } from "@/components/notebook/NotebookHero";
import { NotebookStats } from "@/components/notebook/NotebookStats";
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

type Tab = "chat" | "overview" | "documents" | "notes";

function NotebookPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("chat");

  const readyDocsCount = documents.filter((d) => d.status === "ready").length;
  const processingCount = documents.filter((d) =>
    ["pending", "processing", "chunked", "generating"].includes(d.status),
  ).length;

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
    const [nbRes, docsRes] = await Promise.all([
      supabase.from("notebooks").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("documents")
        .select("*")
        .eq("notebook_id", id)
        .order("created_at", { ascending: false }),
    ]);
    if (nbRes.error || !nbRes.data) {
      toast.error("Cuaderno no encontrado");
      navigate({ to: "/dashboard" });
      return;
    }
    setNotebook(nbRes.data as Notebook);
    setDocuments((docsRes.data ?? []) as DocumentRow[]);
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

  if (authLoading || loading || !notebook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  const wide = tab === "overview" || tab === "documents" || tab === "notes";

  return (
    <DashboardShell>
      <WorkspaceLayout
        title={notebook.title}
        eyebrow="Cuaderno"
        emoji={notebook.emoji ?? "📓"}
        backTo={{ to: "/dashboard", label: "Biblioteca" }}
        groups={[
          {
            items: [
              {
                key: "chat",
                label: "Chat del cuaderno",
                icon: <MessagesSquare className="w-4 h-4" strokeWidth={1.75} />,
                badge: "IA",
              },
              {
                key: "overview",
                label: "Resumen del cuaderno",
                icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />,
              },
            ],
          },
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
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="inline-flex items-center justify-center w-14 h-14 mb-5 bg-cream/60 border border-border rounded-md">
                  <MessagesSquare className="w-6 h-6 text-ink/40" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-2">
                  Todavía no hay nada para chatear
                </h3>
                <p className="text-sm text-ink/60 max-w-sm">
                  Subí al menos un PDF y esperá a que termine de procesarse para conversar con el
                  contenido de todo el cuaderno.
                </p>
                <button
                  onClick={() => setTab("documents")}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-ink text-paper hover:bg-ink/90 transition-colors rounded-md"
                >
                  Subir documento
                </button>
              </div>
            ) : (
              <ChatPanel
                scope="notebook"
                contextId={id}
                variant="fullheight"
                suggestions={[
                  "¿De qué trata este cuaderno en general?",
                  "Resumime las ideas principales de todos los documentos",
                  "Compará los conceptos clave entre los documentos",
                ]}
              />
            )}
          </div>
        )}

        {tab === "overview" && (
          <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-8">
            <NotebookHero
              title={notebook.title}
              description={notebook.description}
              emoji={notebook.emoji ?? "📓"}
              coverColor={notebook.cover_color}
              createdAt={notebook.created_at}
              documentsCount={documents.length}
              readyDocsCount={readyDocsCount}
              notebookId={id}
            />
            <NotebookStats
              notebookId={id}
              documentsCount={documents.length}
              readyDocsCount={readyDocsCount}
              processingCount={processingCount}
            />
          </div>
        )}

        {tab === "documents" && (
          <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-8 animate-fade-up">
            <div className="mb-10">
              <SourceUploader notebookId={id} onUploaded={loadDocuments} />
            </div>

            {documents.length === 0 ? (
              <div className="border-2 border-dashed border-border py-16 text-center bg-cream/20 rounded-lg animate-fade-up">
                <div className="inline-flex items-center justify-center w-14 h-14 mb-5 bg-paper border border-border rounded-md">
                  <FileText className="w-6 h-6 text-ink/40" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-2">Sin documentos todavía</h3>
                <p className="text-sm text-ink/60 max-w-sm mx-auto">
                  Subí un PDF, Word, texto o pegá un link de YouTube. En segundos vas a tener
                  resumen, flashcards y quiz.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-end justify-between mb-5">
                  <h2 className="font-display text-2xl font-semibold tracking-tight">Documentos</h2>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink/40">
                    {documents.length} {documents.length === 1 ? "archivo" : "archivos"}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
                  {documents.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} onChange={loadDocuments} />
                  ))}
                </div>
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
