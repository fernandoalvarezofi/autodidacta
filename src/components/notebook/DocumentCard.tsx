import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileText,
  FileType2,
  Youtube,
  Type,
  BookOpen,
  RotateCcw,
  Trash2,
  Loader2,
  Music2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowUpRight,
  Layers,
  HelpCircle,
  Network,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DocumentRow {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  error_message: string | null;
  created_at: string;
  size_bytes: number | null;
}

interface Props {
  doc: DocumentRow;
  onChange: () => void;
}

/**
 * Tipos: solo el icono cambia. Todo se renderiza con tokens (ink/orange/cream)
 * para mantener la paleta editorial Harvard. Sin gradientes hex hardcoded.
 */
const TYPE_META: Record<string, { icon: typeof FileText; label: string }> = {
  pdf:     { icon: FileText,   label: "PDF" },
  docx:    { icon: FileType2,  label: "Word" },
  youtube: { icon: Youtube,    label: "YouTube" },
  tiktok:  { icon: Youtube,    label: "TikTok" },
  audio:   { icon: Music2,     label: "Audio" },
  image:   { icon: ImageIcon,  label: "Imagen" },
  text:    { icon: Type,       label: "Texto" },
};

const OUTPUT_BADGES = [
  { type: "summary", icon: BookOpen, label: "Resumen" },
  { type: "mindmap", icon: Network, label: "Mapa" },
  { type: "flashcards", icon: Layers, label: "Flash" },
  { type: "quiz", icon: HelpCircle, label: "Quiz" },
] as const;

export function DocumentCard({ doc, onChange }: Props) {
  const isProcessing = ["pending", "processing", "chunked", "generating"].includes(doc.status);
  const isReady = doc.status === "ready";
  const isError = doc.status === "error";
  const [busy, setBusy] = useState(false);
  const [outputs, setOutputs] = useState<Set<string>>(new Set());

  const meta = TYPE_META[doc.type] ?? TYPE_META.text;
  const Icon = meta.icon;

  useEffect(() => {
    if (!isReady) return;
    void (async () => {
      const { data } = await supabase
        .from("document_outputs")
        .select("type")
        .eq("document_id", doc.id);
      setOutputs(new Set((data ?? []).map((o) => o.type)));
    })();
  }, [doc.id, isReady]);

  const handleRetry = async () => {
    setBusy(true);
    try {
      await supabase
        .from("documents")
        .update({ status: "pending", progress: 0, error_message: null })
        .eq("id", doc.id);
      void supabase.functions.invoke("process-document", {
        body: { documentId: doc.id },
      });
      toast.success("Reintentando…");
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
    <article
      className={`group relative bg-card border border-border hover:border-ink/30 hover:shadow-soft transition-all duration-200 rounded-md overflow-hidden ${
        isError ? "border-destructive/40" : ""
      }`}
    >
      {/* Acento crimson superior en hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-orange opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-4">
        {/* Header: icono + tipo + estado */}
        <header className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 w-9 h-9 inline-flex items-center justify-center bg-cream border border-border rounded-md group-hover:border-orange/30 group-hover:bg-orange/[0.06] transition-colors">
              <Icon className="w-4 h-4 text-ink/70 group-hover:text-orange transition-colors" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/55 leading-none mb-1">
                {meta.label}
              </p>
              <p className="text-[11px] text-ink/55 leading-none truncate">
                {doc.size_bytes ? formatSize(doc.size_bytes) : "—"} ·{" "}
                {new Date(doc.created_at).toLocaleDateString("es", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          {/* Status pill */}
          <StatusPill isReady={isReady} isProcessing={isProcessing} isError={isError} status={doc.status} />
        </header>

        {/* Title */}
        <h3 className="font-display text-[19px] leading-snug text-ink line-clamp-2 mb-3 group-hover:text-orange-deep transition-colors">
          {doc.title}
        </h3>

        {/* Progress bar */}
        {isProcessing && (
          <div className="mb-3">
            <div className="h-[3px] bg-cream rounded-full overflow-hidden">
              <div
                className="h-full bg-ink transition-all duration-500"
                style={{ width: `${Math.max(doc.progress, 4)}%` }}
              />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/50 mt-1.5">
              {statusLabel(doc.status)} · {doc.progress}%
            </p>
          </div>
        )}

        {/* Outputs */}
        {isReady && outputs.size > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {OUTPUT_BADGES.filter((b) => outputs.has(b.type)).map((b) => {
              const BIcon = b.icon;
              return (
                <span
                  key={b.type}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-cream border border-border rounded text-[10px] font-mono text-ink/65"
                >
                  <BIcon className="w-2.5 h-2.5" strokeWidth={2} />
                  {b.label}
                </span>
              );
            })}
          </div>
        )}

        {isError && doc.error_message && (
          <p className="text-[12px] text-destructive line-clamp-2 mb-3 leading-relaxed">
            {doc.error_message}
          </p>
        )}

        {/* Actions */}
        <footer className="flex items-center gap-1.5 pt-2 border-t border-border/70">
          {isReady && (
            <Link
              to="/document/$id"
              params={{ id: doc.id }}
              className="group/btn flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-[12.5px] font-medium bg-ink text-paper hover:bg-orange transition-colors rounded-md"
            >
              Estudiar
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" strokeWidth={2.25} />
            </Link>
          )}
          {isError && (
            <button
              onClick={handleRetry}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-[12.5px] font-medium border border-ink/80 text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-50 rounded-md"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={2} />
              Reintentar
            </button>
          )}
          {isProcessing && (
            <div className="flex-1 inline-flex items-center justify-center gap-2 h-8 text-[11px] font-mono uppercase tracking-[0.16em] text-ink/55 bg-cream border border-border rounded-md">
              <Loader2 className="w-3 h-3 animate-spin text-orange" />
              Procesando
            </div>
          )}
          {!isProcessing && (
            <button
              onClick={handleDelete}
              disabled={busy}
              className="inline-flex items-center justify-center w-8 h-8 text-ink/40 hover:text-destructive hover:bg-destructive/[0.06] transition-all disabled:opacity-50 rounded-md"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}

function StatusPill({
  isReady,
  isProcessing,
  isError,
  status,
}: {
  isReady: boolean;
  isProcessing: boolean;
  isError: boolean;
  status: string;
}) {
  if (isReady) {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange/[0.08] border border-orange/25 rounded text-[10px] font-mono uppercase tracking-[0.14em] text-orange-deep">
        <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2.5} />
        Listo
      </span>
    );
  }
  if (isProcessing) {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-cream border border-border rounded text-[10px] font-mono uppercase tracking-[0.14em] text-ink/65">
        <Loader2 className="w-2.5 h-2.5 animate-spin" strokeWidth={2.5} />
        {statusLabel(status)}
      </span>
    );
  }
  if (isError) {
    return (
      <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 bg-destructive/[0.08] border border-destructive/30 rounded text-[10px] font-mono uppercase tracking-[0.14em] text-destructive">
        Error
      </span>
    );
  }
  return null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
