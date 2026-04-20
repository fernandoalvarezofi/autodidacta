import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Files,
  MessagesSquare,
  NotebookPen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
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

function NotebookPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"documents" | "notes" | "chat">("documents");

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

  return (
    <DashboardShell>
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-8 relative">
        {/* Breadcrumb editorial */}
        <nav className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-ink/40 mb-6 animate-fade-in">
          <Link
            to="/dashboard"
            className="hover:text-orange transition-colors inline-flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2} />
            Biblioteca
          </Link>
          <span className="text-ink/25">/</span>
          <span className="text-ink/60 truncate max-w-[300px]">{notebook.title}</span>
        </nav>

        {/* Hero editorial con cover ilustrado */}
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

        {/* Stats */}
        <NotebookStats
          notebookId={id}
          documentsCount={documents.length}
          readyDocsCount={readyDocsCount}
          processingCount={processingCount}
        />

        {/* Tabs */}
        <div
          className="flex gap-1 mb-8 border-b border-border animate-fade-up sticky top-16 bg-paper/85 backdrop-blur-xl z-20 -mx-6 px-6 lg:-mx-10 lg:px-10"
          style={{ animationDelay: "120ms" }}
        >
          <TabBtn
            active={tab === "documents"}
            onClick={() => setTab("documents")}
            icon={<Files className="w-4 h-4" strokeWidth={1.75} />}
            label="Documentos"
            count={documents.length}
          />
          <TabBtn
            active={tab === "notes"}
            onClick={() => setTab("notes")}
            icon={<NotebookPen className="w-4 h-4" strokeWidth={1.75} />}
            label="Notas"
          />
          <TabBtn
            active={tab === "chat"}
            onClick={() => setTab("chat")}
            icon={<MessagesSquare className="w-4 h-4" strokeWidth={1.75} />}
            label="Chat del cuaderno"
          />
        </div>

        {tab === "documents" && (
          <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
            {/* Upload area */}
            <div className="mb-10">
              <SourceUploader notebookId={id} onUploaded={loadDocuments} />
            </div>

            {/* Documents grid */}
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
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    Documentos
                  </h2>
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
          <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
            <NotesList notebookId={id} />
          </div>
        )}

        {tab === "chat" && (
          <div className="animate-fade-up max-w-3xl mx-auto h-[calc(100vh-360px)] min-h-[480px]">
            {readyDocsCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-border p-10 bg-cream/20 rounded-lg">
                <div className="inline-flex items-center justify-center w-14 h-14 mb-5 bg-paper border border-border rounded-md">
                  <MessagesSquare className="w-6 h-6 text-ink/40" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-2">
                  Todavía no hay nada para chatear
                </h3>
                <p className="text-sm text-ink/60 max-w-sm">
                  Subí al menos un PDF y esperá a que termine de procesarse para conversar con el
                  contenido de todo el cuaderno.
                </p>
              </div>
            ) : (
              <ChatPanel
                scope="notebook"
                contextId={id}
                suggestions={[
                  "¿De qué trata este cuaderno en general?",
                  "Resumime las ideas principales de todos los documentos",
                  "Compará los conceptos clave entre los documentos",
                ]}
              />
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition-all -mb-px border-b-2 whitespace-nowrap ${
        active
          ? "border-orange text-ink font-medium"
          : "border-transparent text-ink/50 hover:text-ink"
      }`}
    >
      <span className={active ? "text-orange" : ""}>{icon}</span>
      {label}
      {count !== undefined && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
            active ? "bg-orange/15 text-orange-deep" : "bg-cream text-ink/50"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
