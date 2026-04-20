import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  FileText,
  FileType2,
  Youtube,
  Type,
  BookOpen,
  RotateCcw,
  Trash2,
  Sparkles,
  Files,
  MessagesSquare,
  CheckCircle2,
  Clock,
  NotebookPen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SourceUploader } from "@/components/document/SourceUploader";
import { NotesList } from "@/components/editor/NotesList";
import { toast } from "sonner";

export const Route = createFileRoute("/notebook/$id")({
  component: NotebookPage,
});

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface DocumentRow {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  error_message: string | null;
  created_at: string;
  size_bytes: number | null;
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
  }, [user, documents]);

  const loadData = async () => {
    setLoading(true);
    const [nbRes, docsRes] = await Promise.all([
      supabase.from("notebooks").select("*").eq("id", id).maybeSingle(),
      supabase.from("documents").select("*").eq("notebook_id", id).order("created_at", { ascending: false }),
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

  // Upload logic moved to <SourceUploader />

  if (authLoading || loading || !notebook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-10 relative">
        {/* Decorative radial glow */}
        <div className="absolute top-20 right-0 w-[500px] h-[400px] -z-10 opacity-30 bg-radial-orange pointer-events-none" />

        {/* Breadcrumb editorial */}
        <nav className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-ink/40 mb-8 animate-fade-in">
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

        {/* Header */}
        <div className="pb-8 mb-10 border-b-2 border-ink animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-3">
                Cuaderno
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mb-3 leading-[1.05]">
                {notebook.title}
              </h1>
              {notebook.description && (
                <p className="text-ink/60 max-w-2xl leading-relaxed">{notebook.description}</p>
              )}

              {/* Stats line */}
              <div className="flex items-center gap-5 mt-5 text-xs font-mono text-ink/50">
                <span className="inline-flex items-center gap-1.5">
                  <Files className="w-3.5 h-3.5" strokeWidth={2} />
                  {documents.length} {documents.length === 1 ? "documento" : "documentos"}
                </span>
                {readyDocsCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-orange-deep">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                    {readyDocsCount} {readyDocsCount === 1 ? "listo" : "listos"}
                  </span>
                )}
                {processingCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-pulse" strokeWidth={2} />
                    {processingCount} procesando
                  </span>
                )}
              </div>
            </div>

            {readyDocsCount > 0 && (
              <Link
                to="/review/$notebookId"
                params={{ notebookId: id }}
                className="group inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95 self-start md:self-auto"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" strokeWidth={2} />
                Repasar ahora
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border animate-fade-up" style={{ animationDelay: "60ms" }}>
          <button
            onClick={() => setTab("documents")}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition-all -mb-px border-b-2 ${
              tab === "documents"
                ? "border-orange text-ink font-medium"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            <Files className="w-4 h-4" strokeWidth={1.75} />
            Documentos
            <span className="text-xs font-mono text-ink/40">({documents.length})</span>
          </button>
          <button
            onClick={() => setTab("notes")}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition-all -mb-px border-b-2 ${
              tab === "notes"
                ? "border-orange text-ink font-medium"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            <NotebookPen className="w-4 h-4" strokeWidth={1.75} />
            Notas
          </button>
          <button
            onClick={() => setTab("chat")}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition-all -mb-px border-b-2 ${
              tab === "chat"
                ? "border-orange text-ink font-medium"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            <MessagesSquare className="w-4 h-4" strokeWidth={1.75} />
            Chat del cuaderno
          </button>
        </div>

        {tab === "notes" && (
          <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <NotesList notebookId={id} />
          </div>
        )}

        {tab === "documents" && (
          <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            {/* Upload area — multi-source */}
            <div className="mb-10">
              <SourceUploader notebookId={id} onUploaded={loadDocuments} />
            </div>

            {/* Documents list */}
            {documents.length === 0 ? (
              <div className="border-2 border-dashed border-border py-16 text-center bg-cream/20 animate-fade-up">
                <div className="inline-flex items-center justify-center w-14 h-14 mb-5 bg-paper border border-border">
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
                <div className="space-y-3 stagger">
                  {documents.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} onChange={loadDocuments} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "chat" && (
          <div className="animate-fade-up max-w-3xl mx-auto h-[calc(100vh-360px)] min-h-[480px]">
            {readyDocsCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-border p-10 bg-cream/20">
                <div className="inline-flex items-center justify-center w-14 h-14 mb-5 bg-paper border border-border">
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

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentCard({ doc, onChange }: { doc: DocumentRow; onChange: () => void }) {
  const isProcessing = ["pending", "processing", "chunked", "generating"].includes(doc.status);
  const isReady = doc.status === "ready";
  const isError = doc.status === "error";
  const [busy, setBusy] = useState(false);

  const handleRetry = async () => {
    setBusy(true);
    try {
      await supabase
        .from("documents")
        .update({ status: "pending", progress: 0, error_message: null })
        .eq("id", doc.id);
      void supabase.functions.invoke("process-document", { body: { documentId: doc.id } });
      toast.success("Reintentando...");
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al reintentar");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este documento? Esta acción no se puede deshacer.")) return;
    setBusy(true);
    try {
      await supabase.from("documents").delete().eq("id", doc.id);
      toast.success("Documento eliminado");
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`group relative bg-paper border border-border p-5 hover:border-ink hover:shadow-elevated hover:-translate-y-0.5 transition-all overflow-hidden ${
        isError ? "border-destructive/30" : ""
      }`}
    >
      {/* Status accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 transition-opacity ${
          isReady
            ? "bg-gradient-orange opacity-100"
            : isError
              ? "bg-destructive opacity-80"
              : isProcessing
                ? "bg-orange/40 opacity-100 animate-pulse"
                : "opacity-0"
        }`}
      />

      <div className="flex items-center gap-5">
        {/* Icon */}
        <div
          className={`w-12 h-12 flex items-center justify-center flex-shrink-0 border transition-all ${
            isReady
              ? "border-orange/40 bg-orange/5 group-hover:bg-orange/10"
              : isError
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-cream/40"
          }`}
        >
          {(() => {
            const Icon =
              doc.type === "docx"
                ? FileType2
                : doc.type === "youtube"
                  ? Youtube
                  : doc.type === "text"
                    ? Type
                    : FileText;
            return (
              <Icon
                className={`w-5 h-5 ${
                  isReady ? "text-orange" : isError ? "text-destructive" : "text-ink/50"
                }`}
                strokeWidth={1.75}
              />
            );
          })()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-medium text-ink truncate leading-tight">
            {doc.title}
          </h3>
          <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink/40 mt-1">
            {typeLabel(doc.type)}
            {doc.size_bytes ? ` · ${formatSize(doc.size_bytes)}` : ""}
            {" · "}
            {new Date(doc.created_at).toLocaleDateString("es", {
              day: "2-digit",
              month: "short",
            })}
          </p>
          {isProcessing && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 max-w-xs h-1 bg-border overflow-hidden rounded-full">
                <div
                  className="h-full bg-gradient-orange transition-all duration-500"
                  style={{ width: `${doc.progress}%` }}
                />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink/60">
                {statusLabel(doc.status)}
              </span>
            </div>
          )}
          {isError && doc.error_message && (
            <p className="text-xs text-destructive mt-2 line-clamp-2">{doc.error_message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isProcessing && <Loader2 className="w-5 h-5 animate-spin text-orange" />}
          {isError && (
            <button
              onClick={handleRetry}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              Reintentar
            </button>
          )}
          {isReady && (
            <Link
              to="/document/$id"
              params={{ id: doc.id }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" strokeWidth={1.75} />
              Estudiar
            </Link>
          )}
          {!isProcessing && (
            <button
              onClick={handleDelete}
              disabled={busy}
              className="p-2 text-ink/30 hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-50"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "En cola";
    case "processing":
      return "Extrayendo";
    case "chunked":
      return "Analizando";
    case "generating":
      return "Generando";
    default:
      return status;
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case "pdf":
      return "PDF";
    case "docx":
      return "Word";
    case "text":
      return "Texto";
    case "youtube":
      return "YouTube";
    case "audio":
      return "Audio";
    case "image":
      return "Imagen";
    default:
      return type;
  }
}
