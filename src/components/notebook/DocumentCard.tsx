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
  Sparkles,
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

const TYPE_THEMES: Record<
  string,
  { gradient: string; icon: typeof FileText; label: string; tint: string }
> = {
  pdf: {
    gradient: "from-[#dc2626] via-[#ea580c] to-[#f59e0b]",
    icon: FileText,
    label: "PDF",
    tint: "text-[#dc2626]",
  },
  docx: {
    gradient: "from-[#1e40af] via-[#3b82f6] to-[#60a5fa]",
    icon: FileType2,
    label: "Word",
    tint: "text-[#1e40af]",
  },
  youtube: {
    gradient: "from-[#dc2626] via-[#7f1d1d] to-[#0f0f0f]",
    icon: Youtube,
    label: "YouTube",
    tint: "text-[#dc2626]",
  },
  tiktok: {
    gradient: "from-[#0f0f0f] via-[#ec4899] to-[#06b6d4]",
    icon: Youtube,
    label: "TikTok",
    tint: "text-[#0f0f0f]",
  },
  audio: {
    gradient: "from-[#7c3aed] via-[#a855f7] to-[#ec4899]",
    icon: Music2,
    label: "Audio",
    tint: "text-[#7c3aed]",
  },
  image: {
    gradient: "from-[#059669] via-[#10b981] to-[#34d399]",
    icon: ImageIcon,
    label: "Imagen",
    tint: "text-[#059669]",
  },
  text: {
    gradient: "from-ink/80 via-ink/60 to-ink/40",
    icon: Type,
    label: "Texto",
    tint: "text-ink",
  },
};

const OUTPUT_BADGES = [
  { type: "summary", icon: BookOpen, label: "Resumen" },
  { type: "mindmap", icon: Network, label: "Mapa" },
  { type: "flashcards", icon: Layers, label: "Flash" },
  { type: "quiz", icon: HelpCircle, label: "Quiz" },
] as const;

export function DocumentCard({ doc, onChange }: Props) {
  const isProcessing = ["pending", "processing", "chunked", "generating"].includes(
    doc.status,
  );
  const isReady = doc.status === "ready";
  const isError = doc.status === "error";
  const [busy, setBusy] = useState(false);
  const [outputs, setOutputs] = useState<Set<string>>(new Set());

  const theme = TYPE_THEMES[doc.type] ?? TYPE_THEMES.text;
  const Icon = theme.icon;

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
      className={`group relative bg-paper border border-border rounded-lg overflow-hidden hover:border-ink hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 ${
        isError ? "border-destructive/30" : ""
      }`}
    >
      {/* Thumbnail por tipo */}
      <div className={`relative h-[120px] bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
        {/* Patrón sutil */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />

        {/* Icono grande */}
        <div className="absolute bottom-3 left-4 text-paper">
          <Icon
            className="w-12 h-12 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            strokeWidth={1.5}
          />
        </div>

        {/* Tipo badge */}
        <div className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 bg-paper/95 backdrop-blur-sm rounded-full text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-ink shadow-soft">
          {theme.label}
        </div>

        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          {isReady && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-paper/95 backdrop-blur-sm rounded-full text-[10px] font-mono uppercase tracking-wider text-orange-deep shadow-soft">
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
              Listo
            </div>
          )}
          {isProcessing && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-paper/95 backdrop-blur-sm rounded-full text-[10px] font-mono uppercase tracking-wider text-ink/70 shadow-soft">
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2.5} />
              {statusLabel(doc.status)}
            </div>
          )}
          {isError && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/95 backdrop-blur-sm rounded-full text-[10px] font-mono uppercase tracking-wider text-paper shadow-soft">
              Error
            </div>
          )}
        </div>

        {/* Progreso barra (si procesando) */}
        {isProcessing && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-paper/30">
            <div
              className="h-full bg-paper transition-all duration-500"
              style={{ width: `${doc.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-ink leading-snug line-clamp-2 mb-2 group-hover:text-orange-deep transition-colors">
          {doc.title}
        </h3>

        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40 mb-3">
          {doc.size_bytes ? `${formatSize(doc.size_bytes)} · ` : ""}
          {new Date(doc.created_at).toLocaleDateString("es", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>

        {/* Badges de outputs disponibles */}
        {isReady && outputs.size > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {OUTPUT_BADGES.filter((b) => outputs.has(b.type)).map((b) => {
              const BIcon = b.icon;
              return (
                <span
                  key={b.type}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-cream border border-border rounded-full text-[10px] font-mono text-ink/70"
                >
                  <BIcon className="w-2.5 h-2.5" strokeWidth={2} />
                  {b.label}
                </span>
              );
            })}
          </div>
        )}

        {isError && doc.error_message && (
          <p className="text-xs text-destructive line-clamp-2 mb-3">{doc.error_message}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isReady && (
            <Link
              to="/document/$id"
              params={{ id: doc.id }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95 rounded-md"
            >
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              Estudiar
            </Link>
          )}
          {isError && (
            <button
              onClick={handleRetry}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-50 rounded-md"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              Reintentar
            </button>
          )}
          {isProcessing && (
            <div className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-ink/60 border border-border rounded-md bg-cream/40">
              <Loader2 className="w-3 h-3 animate-spin text-orange" />
              {doc.progress}%
            </div>
          )}
          {!isProcessing && (
            <button
              onClick={handleDelete}
              disabled={busy}
              className="p-2 text-ink/30 hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-50 rounded-md border border-transparent hover:border-destructive/20"
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
