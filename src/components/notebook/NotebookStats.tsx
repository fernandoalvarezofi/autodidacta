import { useEffect, useState } from "react";
import { FileText, Layers, Flame, CalendarClock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCountUp } from "@/hooks/use-count-up";

interface Props {
  notebookId: string;
  documentsCount: number;
  readyDocsCount: number;
  processingCount: number;
}

interface Stats {
  flashcardsTotal: number;
  flashcardsDue: number;
  lastStudyAt: string | null;
}

export function NotebookStats({
  notebookId,
  documentsCount,
  readyDocsCount,
  processingCount,
}: Props) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId]);

  const load = async () => {
    const now = new Date().toISOString();
    const [{ count: total }, { count: due }, { data: lastReview }] = await Promise.all([
      supabase
        .from("flashcards")
        .select("id", { count: "exact", head: true })
        .eq("notebook_id", notebookId),
      supabase
        .from("flashcards")
        .select("id", { count: "exact", head: true })
        .eq("notebook_id", notebookId)
        .lte("next_review_at", now),
      supabase
        .from("flashcards")
        .select("last_reviewed_at")
        .eq("notebook_id", notebookId)
        .not("last_reviewed_at", "is", null)
        .order("last_reviewed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setStats({
      flashcardsTotal: total ?? 0,
      flashcardsDue: due ?? 0,
      lastStudyAt: lastReview?.last_reviewed_at ?? null,
    });
  };

  const lastStudyLabel = stats?.lastStudyAt
    ? relativeTime(stats.lastStudyAt)
    : "Sin estudios";

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10 animate-fade-up"
      style={{ animationDelay: "80ms" }}
    >
      <StatCard
        icon={<FileText className="w-4 h-4" strokeWidth={1.75} />}
        label="Documentos"
        value={documentsCount}
        sublabel={
          processingCount > 0
            ? `${processingCount} procesando`
            : `${readyDocsCount} listos`
        }
        accent="ink"
      />
      <StatCard
        icon={<Layers className="w-4 h-4" strokeWidth={1.75} />}
        label="Flashcards"
        value={stats?.flashcardsTotal ?? null}
        sublabel="creadas en total"
        accent="cream"
      />
      <StatCard
        icon={<Flame className="w-4 h-4" strokeWidth={1.75} />}
        label="Para repasar"
        value={stats?.flashcardsDue ?? null}
        sublabel={
          stats && stats.flashcardsDue > 0 ? "vencidas hoy" : "estás al día"
        }
        accent="orange"
        highlight={!!stats && stats.flashcardsDue > 0}
      />
      <StatCard
        icon={<CalendarClock className="w-4 h-4" strokeWidth={1.75} />}
        label="Último estudio"
        textValue={lastStudyLabel}
        sublabel={
          stats?.lastStudyAt
            ? new Date(stats.lastStudyAt).toLocaleDateString("es", {
                day: "2-digit",
                month: "short",
              })
            : "todavía nada"
        }
        accent="ink"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  textValue,
  sublabel,
  accent,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number | null;
  textValue?: string;
  sublabel: string;
  accent: "orange" | "cream" | "ink";
  highlight?: boolean;
}) {
  const { ref, value: animated } = useCountUp(typeof value === "number" ? value : 0, 700);
  const isLoading = value === null && !textValue;

  const accentRing =
    accent === "orange"
      ? "before:bg-gradient-orange"
      : accent === "ink"
        ? "before:bg-ink"
        : "before:bg-cream";

  return (
    <div
      className={`group relative bg-paper border border-border p-4 rounded-md hover:border-ink hover:shadow-elevated hover:-translate-y-0.5 transition-all overflow-hidden
        before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:opacity-0 group-hover:before:opacity-100 before:transition-opacity ${accentRing}
        ${highlight ? "ring-1 ring-orange/30 bg-orange/[0.03]" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink/50">
          {label}
        </span>
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
            accent === "orange"
              ? "bg-orange/10 text-orange-deep group-hover:bg-orange/20"
              : accent === "ink"
                ? "bg-ink/5 text-ink group-hover:bg-ink/10"
                : "bg-cream text-ink/60 group-hover:bg-cream/80"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-ink/30 my-1" />
        ) : textValue ? (
          <span className="font-display text-2xl font-semibold text-ink leading-none truncate">
            {textValue}
          </span>
        ) : (
          <span
            ref={ref}
            className="font-display text-3xl font-semibold text-ink leading-none tabular-nums"
          >
            {animated}
          </span>
        )}
      </div>
      <p className="text-[11px] text-ink/50 mt-1.5 truncate">{sublabel}</p>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Recién";
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `Hace ${weeks}sem`;
  const months = Math.floor(days / 30);
  return `Hace ${months}m`;
}
