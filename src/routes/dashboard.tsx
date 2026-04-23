import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  LayoutGrid,
  Rows3,
  Check,
  ChevronDown,
  Globe,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EntityIcon } from "@/components/ui/EntityIcon";
import { IconPicker } from "@/components/ui/IconPicker";
import { ClayIcon, type ClayIconKey } from "@/lib/clay-icons";
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
  documents: { id: string; title: string; status: string; type: string }[];
}

type ViewMode = "grid" | "list";
type SortMode = "recent" | "alpha" | "sources";

/**
 * Paleta de "covers" para los cuadernos — derivado del id para mantener color estable.
 * Estilo NotebookLM: gradientes suaves de color por cuaderno.
 */
const COVERS = [
  "from-[#fde9d6] to-[#f7c89a]", // peach
  "from-[#e0e7ff] to-[#a5b4fc]", // indigo
  "from-[#dcfce7] to-[#86efac]", // green
  "from-[#fee2e2] to-[#fca5a5]", // red
  "from-[#fef3c7] to-[#fcd34d]", // amber
  "from-[#e9d5ff] to-[#c4b5fd]", // purple
  "from-[#cffafe] to-[#67e8f9]", // cyan
  "from-[#fce7f3] to-[#f9a8d4]", // pink
];

function coverFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COVERS[h % COVERS.length];
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notebooks, setNotebooks] = useState<NotebookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pickedIcon, setPickedIcon] = useState<ClayIconKey>("notebook");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortMode>("recent");
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data, error } = await supabase
        .from("notebooks")
        .select("id, title, description, emoji, created_at, documents(id, title, status, type)")
        .order("created_at", { ascending: false });
      if (error) toast.error("Error al cargar cuadernos");
      else setNotebooks((data ?? []) as NotebookRow[]);
      setLoading(false);
    })();
  }, [user]);

  const handleCreate = async () => {
    if (!title.trim() || !user) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("notebooks")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        emoji: pickedIcon,
      })
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
    let list = notebooks;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || (n.description ?? "").toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "alpha") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "sources") sorted.sort((a, b) => b.documents.length - a.documents.length);
    else sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted;
  }, [notebooks, search, sort]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-5 h-5 animate-spin text-ink/40" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto px-5 lg:px-10 max-w-[1280px] py-10 lg:py-14">
        {/* HEADER limpio: solo título + subtítulo */}
        <header className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-ink">
            Bienvenido a tu biblioteca
          </h1>
          <p className="text-ink/55 mt-1.5 text-[14px]">
            Cada cuaderno es un espacio de estudio. Subí material y dejá que la IA haga el resto.
          </p>
        </header>

        {/* TOOLBAR estilo NotebookLM: filtros chips a la izquierda, controles a la derecha */}
        {!loading && notebooks.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 mb-6 animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            {/* Filtros izquierda */}
            <div className="flex items-center gap-1.5">
              <FilterChip active>Todos</FilterChip>
              <span className="text-[10px] font-mono text-ink/35 ml-1">
                {filtered.length} {filtered.length === 1 ? "cuaderno" : "cuadernos"}
              </span>
            </div>

            {/* Controles derecha */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/35"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-40 sm:w-52 pl-8 pr-3 py-1.5 text-[12.5px] bg-paper border border-border rounded-full focus:border-ink/40 focus:ring-2 focus:ring-ink/5 focus:outline-none transition-all placeholder:text-ink/35"
                />
              </div>

              {/* View toggle */}
              <div className="hidden sm:flex items-center bg-cream border border-border rounded-full p-0.5">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-full transition-colors ${view === "grid" ? "bg-paper shadow-soft text-ink" : "text-ink/45 hover:text-ink"}`}
                  title="Cuadrícula"
                >
                  <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded-full transition-colors ${view === "list" ? "bg-paper shadow-soft text-ink" : "text-ink/45 hover:text-ink"}`}
                  title="Lista"
                >
                  <Rows3 className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setSortOpen(false), 150)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] bg-paper border border-border rounded-full hover:border-ink/30 transition-colors text-ink/75"
                >
                  {sort === "recent" ? "Más recientes" : sort === "alpha" ? "Alfabético" : "Más fuentes"}
                  <ChevronDown className="w-3 h-3" strokeWidth={2} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-paper border border-border rounded-lg shadow-elevated overflow-hidden z-10 min-w-[160px] animate-scale-in">
                    {(
                      [
                        ["recent", "Más recientes"],
                        ["alpha", "Alfabético"],
                        ["sources", "Más fuentes"],
                      ] as const
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSort(k);
                          setSortOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] hover:bg-cream/60 text-ink/75 text-left"
                      >
                        {sort === k ? (
                          <Check className="w-3.5 h-3.5 text-orange" strokeWidth={2.5} />
                        ) : (
                          <span className="w-3.5" />
                        )}
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Crear nuevo (CTA principal, derecha) */}
              <button
                onClick={() => setShowCreate(true)}
                className="group inline-flex items-center gap-1.5 pl-3 pr-4 py-2 text-[12.5px] font-medium bg-ink text-paper hover:bg-orange transition-colors active:scale-[0.98] rounded-full whitespace-nowrap shadow-soft"
              >
                <Plus
                  className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300"
                  strokeWidth={2.5}
                />
                Crear nuevo
              </button>
            </div>
          </div>
        )}

        {/* Crear cuaderno inline */}
        {showCreate && (
          <div className="mb-8 border border-border bg-paper p-5 shadow-elevated animate-scale-in rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-orange font-mono mb-1">Nuevo cuaderno</p>
                <h2 className="font-display text-lg">Empezá a organizar</h2>
              </div>
            </div>
            <div className="flex items-start gap-4">
              {/* Icono editable */}
              <button
                type="button"
                onClick={() => setIconPickerOpen(true)}
                className="group relative shrink-0 p-1 rounded-xl border border-dashed border-border hover:border-orange/50 hover:bg-orange/[0.04] transition-all"
                title="Cambiar icono"
              >
                <EntityIcon value={pickedIcon} size={64} />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 inline-flex items-center justify-center bg-ink text-paper rounded-full text-[10px] shadow-soft opacity-0 group-hover:opacity-100 transition-opacity">
                  ✎
                </span>
              </button>
              <div className="flex-1 space-y-2.5">
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
                      setPickedIcon("notebook");
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
          </div>
        )}

        <IconPicker
          open={iconPickerOpen}
          value={pickedIcon}
          onPick={setPickedIcon}
          onClose={() => setIconPickerOpen(false)}
          title="Elegí el icono del cuaderno"
        />

        {/* GRID/LIST */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-[210px] border border-border bg-cream/20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : notebooks.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-border py-16 text-center bg-cream/20 rounded-xl">
            <p className="text-[13px] text-ink/50">No hay cuadernos que coincidan con "{search}"</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
            {/* Card "Crear cuaderno" cuando hay pocos */}
            {notebooks.length < 8 && !search && (
              <button
                onClick={() => setShowCreate(true)}
                className="group h-[210px] border-2 border-dashed border-border hover:border-ink/40 hover:bg-cream/40 transition-all rounded-xl flex flex-col items-center justify-center gap-2.5 text-ink/45 hover:text-ink"
              >
                <div className="w-10 h-10 inline-flex items-center justify-center bg-cream group-hover:bg-paper border border-border group-hover:border-ink/30 rounded-full transition-all">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-medium">Crear cuaderno</span>
              </button>
            )}
            {filtered.map((nb) => (
              <NotebookCard key={nb.id} notebook={nb} />
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-paper overflow-hidden divide-y divide-border stagger">
            {filtered.map((nb) => (
              <NotebookListRow key={nb.id} notebook={nb} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

/* ───────────────────────── Filter chip ───────────────────────── */

function FilterChip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={`inline-flex items-center gap-1 px-3 py-1.5 text-[12.5px] rounded-full transition-all ${
        active ? "bg-cream text-ink font-medium" : "text-ink/55 hover:text-ink hover:bg-cream/50"
      }`}
    >
      {active && <Check className="w-3 h-3" strokeWidth={2.5} />}
      {children}
    </button>
  );
}

/* ───────────────────────── Notebook Card (NotebookLM-style) ───────────────────────── */
function resolveIcon(emoji: string | null): ClayIconKey {
  const valid: ClayIconKey[] = [
    "book",
    "notebook",
    "pencil",
    "highlighter",
    "bookmark",
    "library",
    "brain",
    "lightbulb",
    "sparkles",
    "target",
    "compass",
    "atom",
    "flask",
    "dna",
    "microscope",
    "calculator",
    "globe",
    "languages",
    "quote",
    "scroll",
    "calendar",
    "clock",
    "checklist",
    "flag",
    "trophy",
    "headphones",
    "image",
    "video",
    "mic",
    "leaf",
    "flame",
    "mountain",
    "drop",
  ];
  if (emoji && valid.includes(emoji as ClayIconKey)) return emoji as ClayIconKey;
  return "notebook";
}
function NotebookCard({ notebook }: { notebook: NotebookRow }) {
  const total = notebook.documents.length;
  const readyDocs = notebook.documents.filter((d) => d.status === "ready");
  const ready = readyDocs.length;
  const processing = notebook.documents.filter((d) =>
    ["pending", "processing", "chunked", "generating"].includes(d.status),
  ).length;
  const errors = notebook.documents.filter((d) => d.status === "error").length;
  const cover = coverFor(notebook.id);

  return (
    <Link
      to="/notebook/$id"
      params={{ id: notebook.id }}
      className="group relative h-auto min-h-[210px] bg-paper border border-border hover:border-ink/30 transition-all flex flex-col overflow-hidden rounded-xl hover:shadow-elevated hover:-translate-y-0.5"
    >
      {/* Cover gradient zone con emoji */}
      <div className={`relative h-[88px] bg-gradient-to-br ${cover} overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.04]" />
        <div className="absolute top-3 left-3">
          <ClayIcon icon={resolveIcon(notebook.emoji)} size={44} />
        </div>
        {/* Status pill top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {processing > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-paper/85 backdrop-blur-sm rounded-full text-[10px] font-mono text-ink/65">
              <Clock className="w-2.5 h-2.5 animate-pulse" strokeWidth={2.5} /> {processing}
            </span>
          )}
          {errors > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-paper/85 backdrop-blur-sm rounded-full text-[10px] font-mono text-destructive">
              <AlertCircle className="w-2.5 h-2.5" strokeWidth={2.5} /> {errors}
            </span>
          )}
          {ready > 0 && processing === 0 && errors === 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-paper/85 backdrop-blur-sm rounded-full text-[10px] font-mono text-orange-deep">
              <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-4 pt-3 pb-3.5 min-h-0">
        <h3 className="font-display text-[15.5px] font-semibold tracking-tight text-ink line-clamp-2 leading-snug">
          {notebook.title}
        </h3>
        {notebook.description && (
          <p className="text-[12px] text-ink/55 mt-1 line-clamp-1 leading-relaxed">{notebook.description}</p>
        )}

        {/* Acceso rápido a documentos */}
        {ready > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5" onClick={(e) => e.stopPropagation()}>
            {readyDocs.slice(0, 3).map((d) => (
              <Link
                key={d.id}
                to="/document/$id"
                params={{ id: d.id }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-cream border border-border rounded text-xs hover:border-ink/40 transition-colors truncate max-w-[130px]"
                title={d.title}
              >
                {d.title}
              </Link>
            ))}
            {ready > 3 && (
              <Link
                to="/notebook/$id"
                params={{ id: notebook.id }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-cream border border-border rounded text-xs hover:border-ink/40 transition-colors text-orange-deep"
              >
                + {ready - 3} más →
              </Link>
            )}
          </div>
        )}
        {ready === 0 && processing > 0 && (
          <p className="text-xs text-ink/50 mt-2.5 inline-flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Procesando...
          </p>
        )}
        {total === 0 && (
          <Link
            to="/notebook/$id"
            params={{ id: notebook.id }}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-orange hover:text-orange-deep mt-2.5 inline-block font-medium"
          >
            Subí tu primer material →
          </Link>
        )}

        <div className="mt-auto pt-2 flex items-center gap-2 text-[11px] font-mono text-ink/45">
          <span>{relativeDate(notebook.created_at)}</span>
          <span className="text-ink/20">·</span>
          <span>
            {total} {total === 1 ? "fuente" : "fuentes"}
          </span>
          <Globe className="w-3 h-3 ml-auto text-ink/30" strokeWidth={2} />
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
  const cover = coverFor(notebook.id);

  return (
    <Link
      to="/notebook/$id"
      params={{ id: notebook.id }}
      className="group flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors"
    >
      <div className="shrink-0">
        <ClayIcon icon={resolveIcon(notebook.emoji)} size={40} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-[15px] font-semibold tracking-tight text-ink truncate">{notebook.title}</h3>
          <span className="text-[10px] font-mono text-ink/40 flex-shrink-0">{relativeDate(notebook.created_at)}</span>
        </div>
        {notebook.description && <p className="text-[12.5px] text-ink/55 truncate">{notebook.description}</p>}
      </div>
      <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-ink/55 flex-shrink-0">
        <span>
          {total} {total === 1 ? "fuente" : "fuentes"}
        </span>
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
    </Link>
  );
}

/* ───────────────────────── Helpers ───────────────────────── */

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
      {/* halo orange decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-orange/10 blur-[80px] -z-10 rounded-full" />

      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-orange shadow-orange rounded-xl mb-5 animate-pulse-glow">
        <Sparkles className="w-5 h-5 text-paper" strokeWidth={2} />
      </div>
      <p className="text-[10px] uppercase tracking-[0.28em] font-mono text-orange mb-2.5">Empezá acá</p>
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
