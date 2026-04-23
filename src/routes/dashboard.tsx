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
  AlertTriangle,
  Clock,
  Zap,
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
  notebook_id: string;
}

interface Props {
  doc: DocumentRow;
  onChange: () => void;
}

const TYPE_META: Record<string, { icon: typeof FileText; label: string; color: string; bg: string }> = {
  pdf: { icon: FileText, label: "PDF", color: "text-rose-500", bg: "bg-rose-50 border-rose-200" },
  docx: { icon: FileType2, label: "Word", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
  youtube: { icon: Youtube, label: "YouTube", color: "text-red-500", bg: "bg-red-50 border-red-200" },
  tiktok: { icon: Youtube, label: "TikTok", color: "text-pink-500", bg: "bg-pink-50 border-pink-200" },
  audio: { icon: Music2, label: "Audio", color: "text-violet-500", bg: "bg-violet-50 border-violet-200" },
  image: { icon: ImageIcon, label: "Imagen", color: "text-teal-500", bg: "bg-teal-50 border-teal-200" },
  text: { icon: Type, label: "Texto", color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
};

const OUTPUT_BADGES = [
  { type: "summary", icon: BookOpen, label: "Resumen", tab: "summary" },
  { type: "mindmap", icon: Network, label: "Mapa", tab: "mindmap" },
  { type: "flashcards", icon: Layers, label: "Flashcards", tab: "flashcards" },
  { type: "quiz", icon: HelpCircle, label: "Quiz", tab: "quiz" },
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
      const { data } = await supabase.from("document_outputs").select("type").eq("document_id", doc.id);
      setOutputs(new Set((data ?? []).map((o) => o.type)));
    })();
  }, [doc.id, isReady]);

  const handleRetry = async () => {
    setBusy(true);
    try {
      await supabase.from("documents").update({ status: "pending", progress: 0, error_message: null }).eq("id", doc.id);
      void supabase.functions.invoke("process-document", { body: { documentId: doc.id } });
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
      className={`group relative flex flex-col bg-paper rounded-2xl border transition-all duration-300 overflow-hidden
        ${
          isError
            ? "border-destructive/30 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
            : isReady
              ? "border-border hover:border-orange/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
              : "border-border/60"
        }`}
    >
      {/* Barra de color superior según tipo */}
      <div
        className={`h-1 w-full ${
          isError
            ? "bg-destructive"
            : isProcessing
              ? "bg-gradient-to-r from-orange/40 via-orange to-orange/40 animate-pulse"
              : isReady
                ? "bg-gradient-to-r from-orange/60 via-orange to-orange/60"
                : "bg-border"
        }`}
      />

      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
        {/* Header: icono tipo + badge estado */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Ícono del tipo con color */}
            <div
              className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-xl border ${meta.bg} transition-transform group-hover:scale-105`}
            >
              <Icon className={`w-5 h-5 ${meta.color}`} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink/45 leading-none mb-1">
                {meta.label}
              </p>
              <p className="text-[11px] text-ink/40 leading-none">
                {doc.size_bytes ? formatSize(doc.size_bytes) : "—"} ·{" "}
                {new Date(doc.created_at).toLocaleDateString("es", { day: "2-digit", month: "short" })}
              </p>
            </div>
          </div>

          {/* Badge estado */}
          <StatusPill isReady={isReady} isProcessing={isProcessing} isError={isError} status={doc.status} />
        </div>

        {/* Título */}
        <h3
          className={`font-display text-[16px] sm:text-[17px] leading-snug line-clamp-2 transition-colors ${
            isReady ? "text-ink group-hover:text-orange-deep" : "text-ink/80"
          }`}
        >
          {doc.title}
        </h3>

        {/* Barra de progreso */}
        {isProcessing && (
          <div className="space-y-1.5">
            <div className="h-1.5 bg-cream rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange/70 to-orange rounded-full transition-all duration-700"
                style={{ width: `${Math.max(doc.progress, 6)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-ink/45 uppercase tracking-[0.15em]">{statusLabel(doc.status)}</p>
              <p className="text-[10px] font-mono text-orange font-medium">{doc.progress}%</p>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && doc.error_message && (
          <div className="flex items-start gap-2 px-3 py-2 bg-destructive/[0.05] border border-destructive/20 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[11px] text-destructive line-clamp-2 leading-relaxed">{doc.error_message}</p>
          </div>
        )}

        {/* Outputs disponibles — chips */}
        {isReady && outputs.size > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {OUTPUT_BADGES.filter((b) => outputs.has(b.type)).map((b) => {
              const BIcon = b.icon;
              return (
                <Link
                  key={b.type}
                  to="/document/$id"
                  params={{ id: doc.id }}
                  search={{ tab: b.tab }}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-cream border border-border rounded-lg text-[11px] font-mono text-ink/60 hover:bg-orange/[0.06] hover:border-orange/30 hover:text-orange transition-colors"
                >
                  <BIcon className="w-3 h-3" strokeWidth={2} />
                  {b.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Spacer para empujar footer abajo */}
        <div className="flex-1" />

        {/* Footer: acciones */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/60">
          {isReady && (
            <Link
              to="/document/$id"
              params={{ id: doc.id }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 text-[13px] font-medium bg-ink text-paper hover:bg-orange transition-colors rounded-xl min-h-[44px] sm:min-h-0 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" strokeWidth={2} />
              Estudiar
              <ArrowUpRight className="w-3 h-3 ml-auto opacity-60" strokeWidth={2.25} />
            </Link>
          )}

          {isError && (
            <button
              onClick={handleRetry}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 text-[13px] font-medium border border-border text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-50 rounded-xl min-h-[44px] sm:min-h-0"
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              Reintentar
            </button>
          )}

          {isProcessing && (
            <div className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 text-[11px] font-mono text-ink/50 bg-cream border border-border rounded-xl">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange" />
              <span className="uppercase tracking-[0.15em]">Procesando</span>
              <Clock className="w-3 h-3 ml-auto opacity-40" />
            </div>
          )}

          {!isProcessing && (
            <button
              onClick={handleDelete}
              disabled={busy}
              className="shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 text-ink/30 hover:text-destructive hover:bg-destructive/[0.06] transition-all disabled:opacity-50 rounded-xl"
              title="Eliminar"
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              )}
            </button>
          )}
        </div>

        {/* Link repasar flashcards */}
        {isReady && outputs.has("flashcards") && (
          <Link
            to="/review/$notebookId"
            params={{ notebookId: doc.notebook_id }}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-orange hover:text-orange-deep font-medium transition-colors"
          >
            <Layers className="w-3 h-3" strokeWidth={2} />
            Repasar flashcards →
          </Link>
        )}
      </div>
    </article>
  );
}

/* ── Status pill ── */
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
  if (isReady)
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-orange/[0.08] border border-orange/25 rounded-lg text-[10px] font-mono uppercase tracking-[0.14em] text-orange-deep">
        <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2.5} />
        Listo
      </span>
    );
  if (isProcessing)
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-cream border border-border rounded-lg text-[10px] font-mono uppercase tracking-[0.14em] text-ink/55">
        <Loader2 className="w-2.5 h-2.5 animate-spin" strokeWidth={2.5} />
        {statusLabel(status)}
      </span>
    );
  if (isError)
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-destructive/[0.08] border border-destructive/30 rounded-lg text-[10px] font-mono uppercase tracking-[0.14em] text-destructive">
        <AlertTriangle className="w-2.5 h-2.5" strokeWidth={2.5} />
        Error
      </span>
    );
  return null;
}

/* ── Helpers ── */
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
