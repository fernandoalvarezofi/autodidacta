import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, CheckCircle2, RotateCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { applySM2, RATING_LABELS, type SM2State } from "@/lib/sm2";
import { toast } from "sonner";

export const Route = createFileRoute("/review/$notebookId")({
  component: ReviewPage,
});

interface FlashcardRow {
  id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
}

interface NotebookRow {
  id: string;
  title: string;
}

function ReviewPage() {
  const { notebookId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notebook, setNotebook] = useState<NotebookRow | null>(null);
  const [queue, setQueue] = useState<FlashcardRow[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, again: 0 });

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user, notebookId]);

  const load = async () => {
    setLoading(true);
    const nowIso = new Date().toISOString();
    const [nbRes, cardsRes] = await Promise.all([
      supabase.from("notebooks").select("id, title").eq("id", notebookId).maybeSingle(),
      supabase
        .from("flashcards")
        .select("id, front, back, ease_factor, interval_days, repetitions, next_review_at")
        .eq("notebook_id", notebookId)
        .lte("next_review_at", nowIso)
        .order("next_review_at", { ascending: true })
        .limit(50),
    ]);
    if (nbRes.error || !nbRes.data) {
      toast.error("Cuaderno no encontrado");
      navigate({ to: "/dashboard" });
      return;
    }
    setNotebook(nbRes.data as NotebookRow);
    setQueue((cardsRes.data ?? []) as FlashcardRow[]);
    setIndex(0);
    setFlipped(false);
    setStats({ reviewed: 0, again: 0 });
    setLoading(false);
  };

  const current = queue[index];

  const handleRate = async (quality: number) => {
    if (!current || submitting) return;
    setSubmitting(true);
    try {
      const prev: SM2State = {
        ease_factor: Number(current.ease_factor),
        interval_days: current.interval_days,
        repetitions: current.repetitions,
      };
      const next = applySM2(prev, quality);

      await supabase
        .from("flashcards")
        .update({
          ease_factor: next.ease_factor,
          interval_days: next.interval_days,
          repetitions: next.repetitions,
          next_review_at: next.next_review_at,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", current.id);

      setStats((s) => ({
        reviewed: s.reviewed + 1,
        again: s.again + (quality < 3 ? 1 : 0),
      }));
      setFlipped(false);
      setIndex((i) => i + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading || !notebook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  const finished = index >= queue.length;

  return (
    <DashboardShell>
      <div className="container mx-auto px-6 lg:px-10 max-w-[760px] py-10">
        <Link
          to="/notebook/$id"
          params={{ id: notebookId }}
          className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Volver al cuaderno
        </Link>

        <div className="pb-6 mb-8 border-b-2 border-ink">
          <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-3">Sesión de repaso</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{notebook.title}</h1>
          {!finished && queue.length > 0 && (
            <p className="text-sm text-ink/60 mt-3 font-mono">
              Tarjeta {index + 1} de {queue.length} · {stats.reviewed} revisadas
            </p>
          )}
        </div>

        {queue.length === 0 ? (
          <EmptyState notebookId={notebookId} />
        ) : finished ? (
          <FinishedState stats={stats} total={queue.length} notebookId={notebookId} onRestart={load} />
        ) : (
          <ReviewCard
            card={current}
            flipped={flipped}
            submitting={submitting}
            onFlip={() => setFlipped((f) => !f)}
            onRate={handleRate}
          />
        )}
      </div>
    </DashboardShell>
  );
}

function ReviewCard({
  card,
  flipped,
  submitting,
  onFlip,
  onRate,
}: {
  card: { front: string; back: string };
  flipped: boolean;
  submitting: boolean;
  onFlip: () => void;
  onRate: (q: number) => void;
}) {
  return (
    <div>
      {/* Flip card with 3D rotation */}
      <div
        className="relative w-full min-h-[320px] mb-8"
        style={{ perspective: "1500px" }}
      >
        <button
          onClick={onFlip}
          aria-label={flipped ? "Mostrar pregunta" : "Mostrar respuesta"}
          className="relative w-full min-h-[320px] text-left"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <CardFace label="Pregunta" content={card.front} hint="Click para revelar" />
          {/* Back */}
          <CardFace label="Respuesta" content={card.back} hint="Calificá tu recuerdo" back />
        </button>
      </div>

      {/* Rating buttons (only when revealed) */}
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-opacity duration-300 ${
          flipped ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {[0, 3, 4, 5].map((q) => (
          <RatingButton key={q} quality={q} disabled={submitting} onClick={() => onRate(q)} />
        ))}
      </div>

      {!flipped && (
        <p className="text-center text-xs uppercase tracking-wider font-mono text-ink/40 mt-4">
          Pensá tu respuesta y luego volteá la tarjeta
        </p>
      )}
    </div>
  );
}

function CardFace({
  label,
  content,
  hint,
  back = false,
}: {
  label: string;
  content: string;
  hint: string;
  back?: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 bg-cream/40 border-2 border-ink p-10 md:p-14 flex flex-col ${
        back ? "bg-cream/70" : ""
      }`}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-5">{label}</p>
      <p className="font-display text-2xl md:text-3xl text-ink leading-snug flex-1">{content}</p>
      <p className="text-xs text-ink/40 mt-6 font-mono uppercase tracking-wider">{hint}</p>
    </div>
  );
}

function RatingButton({
  quality,
  disabled,
  onClick,
}: {
  quality: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const meta = RATING_LABELS[quality];
  const accent = useMemo(() => {
    if (quality === 0) return "border-destructive text-destructive hover:bg-destructive hover:text-paper";
    if (quality === 3) return "border-ink/60 text-ink hover:bg-ink/80 hover:text-paper";
    if (quality === 4) return "border-orange text-orange hover:bg-orange hover:text-paper";
    return "border-ink text-ink hover:bg-ink hover:text-paper";
  }, [quality]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 py-4 border-2 transition-colors disabled:opacity-50 ${accent}`}
    >
      <span className="font-display text-base font-semibold">{meta.label}</span>
      <span className="text-[10px] uppercase tracking-wider font-mono opacity-70">{meta.hint}</span>
    </button>
  );
}

function EmptyState({ notebookId }: { notebookId: string }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-border">
      <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-ink/30" strokeWidth={1.5} />
      <p className="font-display text-xl text-ink mb-2">No hay tarjetas para repasar</p>
      <p className="text-sm text-ink/60 mb-6">Volvé más tarde o subí un nuevo documento.</p>
      <Link
        to="/notebook/$id"
        params={{ id: notebookId }}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-ink hover:bg-ink hover:text-paper transition-colors"
      >
        Volver al cuaderno
      </Link>
    </div>
  );
}

function FinishedState({
  stats,
  total,
  notebookId,
  onRestart,
}: {
  stats: { reviewed: number; again: number };
  total: number;
  notebookId: string;
  onRestart: () => void;
}) {
  const success = stats.reviewed - stats.again;
  const pct = stats.reviewed > 0 ? Math.round((success / stats.reviewed) * 100) : 0;
  return (
    <div className="text-center py-12 border-2 border-ink bg-cream/30 px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-4">Sesión completa</p>
      <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-3">
        ¡Buen trabajo!
      </h2>
      <p className="text-ink/70 mb-8">
        Revisaste {stats.reviewed} de {total} tarjetas · {pct}% de aciertos
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <RotateCw className="w-4 h-4" strokeWidth={1.75} />
          Buscar más
        </button>
        <Link
          to="/notebook/$id"
          params={{ id: notebookId }}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-ink text-paper hover:bg-ink/90 transition-colors"
        >
          Volver al cuaderno
        </Link>
      </div>
    </div>
  );
}
