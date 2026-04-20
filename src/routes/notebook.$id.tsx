import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Upload,
  Loader2,
  FileText,
  AlertCircle,
  BookOpen,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
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
}

function NotebookPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    void loadData();
  }, [user, id]);

  // Realtime: refresh on any document change for this notebook
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== "application/pdf") {
      toast.error("Por ahora solo se aceptan archivos PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Máximo 10MB en plan Free");
      return;
    }

    setUploading(true);
    try {
      const ext = "pdf";
      const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("documents").upload(storagePath, file);
      if (uploadErr) throw uploadErr;

      const { data: doc, error: docErr } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          notebook_id: id,
          title: file.name.replace(/\.pdf$/i, ""),
          type: "pdf",
          storage_path: storagePath,
          size_bytes: file.size,
          status: "pending",
        })
        .select()
        .single();
      if (docErr || !doc) throw docErr ?? new Error("Insert failed");

      // Trigger processing (fire and forget)
      void supabase.functions.invoke("process-document", {
        body: { documentId: doc.id },
      });

      toast.success("PDF subido. Procesando...");
      void loadDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Volver
        </Link>

        <div className="pb-8 mb-10 border-b-2 border-ink">
          <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-3">Cuaderno</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            {notebook.title}
          </h1>
          {notebook.description && <p className="text-ink/60 max-w-2xl">{notebook.description}</p>}
        </div>

        {/* Upload area */}
        <div className="mb-12">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-border hover:border-ink hover:bg-cream/40 disabled:opacity-50 transition-colors py-12 text-center group"
          >
            {uploading ? (
              <>
                <Loader2 className="w-7 h-7 mx-auto mb-3 animate-spin text-ink/40" />
                <p className="text-sm text-ink/60">Subiendo...</p>
              </>
            ) : (
              <>
                <Upload className="w-7 h-7 mx-auto mb-3 text-ink/40 group-hover:text-orange transition-colors" strokeWidth={1.5} />
                <p className="text-base font-display font-medium text-ink mb-1">Subí tu PDF</p>
                <p className="text-xs text-ink/50 font-mono uppercase tracking-wider">
                  Máx 10MB · Procesamiento automático
                </p>
              </>
            )}
          </button>
        </div>

        {/* Documents list */}
        {documents.length === 0 ? (
          <div className="text-center py-12 text-ink/50 text-sm">
            Todavía no hay documentos en este cuaderno.
          </div>
        ) : (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6 pb-3 border-b border-border">
              Documentos
            </h2>
            <div className="divide-y divide-border border-y border-border">
              {documents.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} onChange={loadDocuments} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function DocumentRow({ doc, onChange }: { doc: DocumentRow; onChange: () => void }) {
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
    <div className="py-5 flex items-center gap-5">
      <div className="w-10 h-10 border border-border flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-ink/60" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-ink truncate">{doc.title}</h3>
        <p className="text-xs font-mono uppercase tracking-wider text-ink/50 mt-1">
          {doc.type} · {new Date(doc.created_at).toLocaleDateString("es")}
        </p>
        {isProcessing && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 max-w-xs h-1 bg-border overflow-hidden">
              <div
                className="h-full bg-orange transition-all duration-500"
                style={{ width: `${doc.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-ink/60">{statusLabel(doc.status)}</span>
          </div>
        )}
        {isError && doc.error_message && (
          <p className="text-xs text-destructive mt-1.5">{doc.error_message}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isProcessing && <Loader2 className="w-5 h-5 animate-spin text-ink/40" />}
        {isError && (
          <>
            <AlertCircle className="w-5 h-5 text-destructive" strokeWidth={1.75} />
            <button
              onClick={handleRetry}
              disabled={busy}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              Reintentar
            </button>
          </>
        )}
        {isReady && (
          <Link
            to="/document/$id"
            params={{ id: doc.id }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-ink text-paper hover:bg-ink/90 transition-colors"
          >
            <BookOpen className="w-4 h-4" strokeWidth={1.75} />
            Estudiar
          </Link>
        )}
        {!isProcessing && (
          <button
            onClick={handleDelete}
            disabled={busy}
            className="p-2 text-ink/40 hover:text-destructive transition-colors disabled:opacity-50"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
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
