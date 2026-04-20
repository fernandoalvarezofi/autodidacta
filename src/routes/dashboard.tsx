import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Search,
  LayoutGrid,
  Rows3,
  Flame,
  Trophy,
  BookOpen,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useCountUp } from "@/hooks/use-count-up";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

interface NotebookRow {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  created_at: string;
  documents: { id: string; status: string }[];
}

interface ProfileStats {
  xp: number;
  streak_days: number;
  level: string;
}

const LEVEL_THRESHOLDS: Array<{ level: string; min: number; next: number | null }> = [
  { level: "Aprendiz", min: 0, next: 200 },
  { level: "Estudioso", min: 200, next: 700 },
  { level: "Erudito", min: 700, next: 2000 },
  { level: "Maestro", min: 2000, next: 5000 },
  { level: "Sabio", min: 5000, next: null },
];

type ViewMode = "grid" | "list";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notebooks, setNotebooks] = useState<NotebookRow[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [nbRes, profileRes] = await Promise.all([
        supabase
          .from("notebooks")
          .select("id, title, description, emoji, created_at, documents(id, status)")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("xp, streak_days, level")
          .eq("id", user.id)
          .maybeSingle(),
      ]);
      if (nbRes.error) {
        toast.error("Error al cargar cuadernos");
      } else {
        setNotebooks((nbRes.data ?? []) as NotebookRow[]);
      }
      if (profileRes.data) setStats(profileRes.data as ProfileStats);
      setLoading(false);
    })();
  }, [user]);

  const handleCreate = async () => {
    if (!title.trim() || !user) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("notebooks")
      .insert({ user_id: user.id, title: title.trim(), description: description.trim() || null })
      .select()
      .single();
    setCreating(false);
    if (error || !data) {
      toast.error("No se pudo crear el cuaderno");
      return;
    }
    toast.success("Cuaderno creado");
    navigate({ to: "/notebook/$id", params: { id: data.id } });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return notebooks;
    const q = search.toLowerCase();
    return notebooks.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.description ?? "").toLowerCase().includes(q),
    );
  }, [notebooks, search]);

  const totalDocs = useMemo(
    () => notebooks.reduce((acc, nb) => acc + nb.documents.length, 0),
    [notebooks],
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-5 h-5 animate-spin text-ink/40" />
      </div>
    );
  }

  const greeting = getGreeting();
  const firstName = (user.email ?? "").split("@")[0]?.split(/[._-]/)[0] ?? "";
  const niceName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : "estudiante";

  return (
    <DashboardShell>
      <div className="container mx-auto px-5 lg:px-10 max-w-[1280px] py-8 lg:py-12 relative">
        <div className="absolute inset-x-0 top-0 h-[440px] bg-grid-fade -z-10 pointer-events-none" />

        {/* HERO + STATS panel unificado */}
        <section className="mb-12 animate-fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
            {/* Lado izquierdo: saludo */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-orange rounded-full shadow-[0_0_8px_var(--orange)]" />
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink/45 font-mono">
                  {greeting}, {niceName}
                </p>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-[-0.035em] leading-[1.02] text-ink">
                Tu biblioteca
              </h1>
              <p className="text-ink/55 mt-3.5 max-w-xl text-[14.5px] leading-relaxed">
                Organizá tu material en cuadernos. Subí PDFs, audios o videos y dejá que la IA arme
                resúmenes, flashcards y quizzes en segundos.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setShowCreate(true)}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium bg-ink text-paper hover:bg-orange transition-colors active:scale-[0.98] rounded-md whitespace-nowrap shadow-soft"
                >
                  <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.25} />
                  Nuevo cuaderno
                </button>
                {notebooks.length > 0 && (
                  <span className="text-[12px] text-ink/45">
                    o usá <kbd className="px-1.5 py-0.5 bg-cream border border-border rounded text-[10px] font-mono text-ink/65">⌘K</kbd> para buscar
                  </span>
                )}
              </div>
            </div>

            {/* Lado derecho: stats compactas */}
            {stats && <StatsPanel stats={stats} totalNotebooks={notebooks.length} totalDocs={totalDocs} />}
          </div>
        </section>

        {/* Crear cuaderno (modal inline) */}
        {showCreate && (
          <div className="mb-10 border border-border bg-cream/40 backdrop-blur-sm p-6 shadow-elevated animate-scale-in rounded-lg">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-orange font-mono mb-1.5">
                  Nuevo cuaderno
                </p>
                <h2 className="font-display text-xl">Empezá a organizar</h2>
              </div>
            </div>
            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Título (ej: Anatomía II)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleCreate()}
                autoFocus
                className="w-full px-3.5 py-2.5 bg-paper border border-border focus:border-orange/50 focus:ring-1 focus:ring-orange/30 focus:outline-none transition-all font-display text-[15px] rounded-md placeholder:text-ink/35"
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-paper border border-border focus:border-orange/50 focus:ring-1 focus:ring-orange/30 focus:outline-none transition-all resize-none text-[13px] rounded-md placeholder:text-ink/35"
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setTitle("");
                    setDescription("");
                  }}
                  className="px-3.5 py-2 text-[13px] text-ink/70 hover:text-ink hover:bg-cream transition-all rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !title.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-ink text-paper hover:bg-orange disabled:opacity-40 disabled:hover:bg-ink transition-colors rounded-md"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Crear cuaderno"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar: search + view toggle */}
        {!loading && notebooks.length > 0 && (
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[11px] font-mono uppercase tracking-[0.22em] text-ink/55">
                Cuadernos
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cream border border-border rounded text-ink/60">
                {filtered.length}{filtered.length !== notebooks.length && `/${notebooks.length}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/35" strokeWidth={2} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-44 sm:w-56 pl-8 pr-3 py-1.5 text-[12.5px] bg-paper border border-border rounded-md focus:border-orange/50 focus:ring-1 focus:ring-orange/30 focus:outline-none transition-all placeholder:text-ink/35"
                />
              </div>
              <div className="hidden sm:flex items-center bg-cream border border-border rounded-md p-0.5">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded transition-colors ${view === "grid" ? "bg-paper shadow-soft text-ink" : "text-ink/45 hover:text-ink"}`}
                  title="Cuadrícula"
                >
                  <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded transition-colors ${view === "list" ? "bg-paper shadow-soft text-ink" : "text-ink/45 hover:text-ink"}`}
                  title="Lista"
                >
                  <Rows3 className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notebooks grid/list */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[170px] border border-border bg-cream/20 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : notebooks.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-border py-16 text-center bg-cream/20 rounded-lg">
            <p className="text-[13px] text-ink/50">No hay cuadernos que coincidan con "{search}"</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {filtered.map((nb) => (
              <NotebookCard key={nb.id} notebook={nb} />
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-lg bg-paper overflow-hidden divide-y divide-border stagger">
            {filtered.map((nb) => (
              <NotebookListRow key={nb.id} notebook={nb} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

/* ───────────────────────── Stats Panel (compact, inline) ───────────────────────── */

function StatsPanel({
  stats,
  totalNotebooks,
  totalDocs,
}: {
  stats: ProfileStats;
  totalNotebooks: number;
  totalDocs: number;
}) {
  const tier = LEVEL_THRESHOLDS.find((t) => t.level === stats.level) ?? LEVEL_THRESHOLDS[0];
  const progress =
    tier.next === null
      ? 100
      : Math.min(100, Math.round(((stats.xp - tier.min) / (tier.next - tier.min)) * 100));
  const xpToNext = tier.next ? tier.next - stats.xp : 0;

  const { ref: xpRef, value: xpAnim } = useCountUp(stats.xp, 1200);
  const { ref: streakRef, value: streakAnim } = useCountUp(stats.streak_days, 900);

  return (
    <div className="bg-paper border border-border rounded-xl p-5 shadow-soft min-w-[280px] lg:min-w-[340px]">
      {/* Nivel + progreso */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-orange" strokeWidth={2} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink/50">
              Nivel
            </span>
          </div>
          {tier.next !== null && (
            <span className="text-[10px] font-mono text-ink/45 tabular-nums">{progress}%</span>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-2 mb-2.5">
          <p className="font-display text-xl font-semibold text-ink leading-none">
            {stats.level}
          </p>
          {tier.next !== null && (
            <span className="text-[10.5px] font-mono text-ink/45">
              {xpToNext.toLocaleString("es")} XP
            </span>
          )}
        </div>
        <div className="h-1.5 bg-cream rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-orange transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Mini stats grid 2x2 */}
      <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-border/60">
        <MiniStat
          icon={<Flame className="w-3.5 h-3.5 text-orange" strokeWidth={2} />}
          label="Racha"
          value={
            <span ref={streakRef} className="tabular-nums">
              {streakAnim}
              <span className="text-[11px] text-ink/45 font-normal ml-1">
                {stats.streak_days === 1 ? "día" : "días"}
              </span>
            </span>
          }
        />
        <MiniStat
          icon={<Sparkles className="w-3.5 h-3.5 text-orange" strokeWidth={2} />}
          label="XP total"
          value={
            <span ref={xpRef} className="tabular-nums">
              {xpAnim.toLocaleString("es")}
            </span>
          }
        />
        <MiniStat
          icon={<BookOpen className="w-3.5 h-3.5 text-ink/55" strokeWidth={2} />}
          label="Cuadernos"
          value={<span className="tabular-nums">{totalNotebooks}</span>}
        />
        <MiniStat
          icon={<Zap className="w-3.5 h-3.5 text-ink/55" strokeWidth={2} />}
          label="Fuentes"
          value={<span className="tabular-nums">{totalDocs}</span>}
        />
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-cream/40 rounded-md px-2.5 py-2">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[9.5px] uppercase tracking-[0.18em] font-mono text-ink/50">
          {label}
        </span>
      </div>
      <p className="font-display text-[18px] font-semibold text-ink leading-none">{value}</p>
    </div>
  );
}

/* ───────────────────────── Notebook Card (grid) ───────────────────────── */

function NotebookCard({ notebook }: { notebook: NotebookRow }) {
  const total = notebook.documents.length;
  const ready = notebook.documents.filter((d) => d.status === "ready").length;
  const processing = notebook.documents.filter((d) =>
    ["pending", "processing", "chunked", "generating"].includes(d.status),
  ).length;
  const errors = notebook.documents.filter((d) => d.status === "error").length;
  const readyPct = total > 0 ? Math.round((ready / total) * 100) : 0;

  return (
    <Link
      to="/notebook/$id"
      params={{ id: notebook.id }}
      className="group relative bg-paper hover:bg-cream/30 border border-border hover:border-ink/30 p-5 transition-all flex flex-col overflow-hidden rounded-lg hover:shadow-elevated hover:-translate-y-0.5"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 inline-flex items-center justify-center bg-cream border border-border group-hover:border-orange/40 group-hover:bg-orange/10 transition-all rounded-md text-lg">
          {notebook.emoji ?? "📓"}
        </div>
        <ArrowUpRight
          className="w-4 h-4 text-ink/25 group-hover:text-orange group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
          strokeWidth={2}
        />
      </div>

      <h3 className="font-display text-[18px] font-semibold tracking-tight text-ink mb-1 line-clamp-2 leading-snug">
        {notebook.title}
      </h3>
      {notebook.description ? (
        <p className="text-[13px] text-ink/55 mb-4 line-clamp-2 leading-relaxed">
          {notebook.description}
        </p>
      ) : (
        <p className="text-[13px] text-ink/30 italic mb-4">Sin descripción</p>
      )}

      {/* Barra de progreso (listos / total) */}
      {total > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-ink/45 mb-1">
            <span>{ready}/{total} procesados</span>
            <span className="tabular-nums">{readyPct}%</span>
          </div>
          <div className="h-1 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-orange transition-all duration-700 ease-out rounded-full"
              style={{ width: `${readyPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-border/60 flex items-center gap-3 text-[11px] font-mono">
        <span className="text-ink/55">
          {total} {total === 1 ? "fuente" : "fuentes"}
        </span>
        <span className="text-ink/25">·</span>
        <span className="text-ink/40 truncate">{relativeDate(notebook.created_at)}</span>
        <div className="flex items-center gap-1.5 ml-auto">
          {processing > 0 && (
            <span className="inline-flex items-center gap-0.5 text-ink/50" title={`${processing} procesando`}>
              <Clock className="w-3 h-3 animate-pulse" strokeWidth={2.5} /> {processing}
            </span>
          )}
          {errors > 0 && (
            <span className="inline-flex items-center gap-0.5 text-destructive" title={`${errors} con error`}>
              <AlertCircle className="w-3 h-3" strokeWidth={2.5} /> {errors}
            </span>
          )}
          {ready > 0 && processing === 0 && errors === 0 && (
            <span className="inline-flex items-center gap-0.5 text-orange-deep" title="Todos listos">
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ───────────────────────── Notebook Row (list view) ───────────────────────── */

function NotebookListRow({ notebook }: { notebook: NotebookRow }) {
  const total = notebook.documents.length;
  const ready = notebook.documents.filter((d) => d.status === "ready").length;
  const processing = notebook.documents.filter((d) =>
    ["pending", "processing", "chunked", "generating"].includes(d.status),
  ).length;

  return (
    <Link
      to="/notebook/$id"
      params={{ id: notebook.id }}
      className="group flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors"
    >
      <div className="w-9 h-9 inline-flex items-center justify-center bg-cream border border-border group-hover:border-orange/40 transition-all rounded-md text-base flex-shrink-0">
        {notebook.emoji ?? "📓"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-[15px] font-semibold tracking-tight text-ink truncate">
            {notebook.title}
          </h3>
          <span className="text-[10px] font-mono text-ink/40 flex-shrink-0">
            {relativeDate(notebook.created_at)}
          </span>
        </div>
        {notebook.description && (
          <p className="text-[12.5px] text-ink/55 truncate">{notebook.description}</p>
        )}
      </div>
      <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-ink/55 flex-shrink-0">
        <span>{total} {total === 1 ? "fuente" : "fuentes"}</span>
        {processing > 0 && (
          <span className="inline-flex items-center gap-1 text-ink/50">
            <Clock className="w-3 h-3 animate-pulse" /> {processing}
          </span>
        )}
        {ready > 0 && (
          <span className="inline-flex items-center gap-1 text-orange-deep">
            <CheckCircle2 className="w-3 h-3" /> {ready}
          </span>
        )}
      </div>
      <ArrowUpRight
        className="w-4 h-4 text-ink/25 group-hover:text-orange group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0"
        strokeWidth={2}
      />
    </Link>
  );
}

/* ───────────────────────── Helpers ───────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Madrugada";
  if (h < 12) return "Buen día";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days}d`;
  if (days < 30) return `Hace ${Math.floor(days / 7)}sem`;
  return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short" });
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative border border-dashed border-border py-20 px-6 text-center bg-cream/20 animate-fade-up overflow-hidden rounded-xl">
      <div className="absolute inset-0 -z-10 bg-grid pointer-events-none opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-orange/10 blur-[80px] -z-10 rounded-full" />

      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-orange shadow-orange rounded-xl mb-5 animate-pulse-glow">
        <Sparkles className="w-5 h-5 text-paper" strokeWidth={2} />
      </div>
      <p className="text-[10px] uppercase tracking-[0.28em] font-mono text-orange mb-2.5">
        Empezá acá
      </p>
      <h3 className="font-display text-3xl font-semibold mb-2.5 leading-tight tracking-tight">
        Tu biblioteca está vacía
      </h3>
      <p className="text-[14px] text-ink/55 mb-7 max-w-md mx-auto leading-relaxed">
        Creá tu primer cuaderno, subí un PDF y en segundos vas a tener resumen, mapa mental, flashcards y quiz.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium bg-ink text-paper hover:bg-orange transition-colors active:scale-[0.98] rounded-md shadow-soft"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
        Crear mi primer cuaderno
      </button>
    </div>
  );
}
