import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Camera,
  Star,
  BookOpen,
  FileText,
  Zap,
  X,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
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

interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  interests: string[] | null;
  plan: string | null;
}

type ViewMode = "grid" | "list";
type SortMode = "recent" | "alpha" | "sources";

// Paleta editorial vibrante por cuaderno: bg suave + acento + label
const COVERS: { bg: string; accent: string; tag: string; label: string }[] = [
  { bg: "bg-[oklch(95%_0.06_80)]",  accent: "var(--mustard)", tag: "bg-[oklch(75%_0.15_80)]",  label: "AMBAR" },
  { bg: "bg-[oklch(94%_0.05_260)]", accent: "var(--cobalt)",  tag: "bg-[oklch(45%_0.20_260)]", label: "COBALTO" },
  { bg: "bg-[oklch(94%_0.05_150)]", accent: "var(--sage)",    tag: "bg-[oklch(72%_0.07_150)]", label: "SALVIA" },
  { bg: "bg-[oklch(94%_0.06_18)]",  accent: "var(--orange)",  tag: "bg-[oklch(43%_0.165_18)]", label: "CRIMSON" },
  { bg: "bg-[oklch(94%_0.05_330)]", accent: "var(--plum)",    tag: "bg-[oklch(40%_0.12_330)]", label: "CIRUELA" },
  { bg: "bg-cream",                  accent: "var(--ink)",    tag: "bg-ink",                   label: "TINTA" },
];

function coverFor(id: string): (typeof COVERS)[number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COVERS[h % COVERS.length];
}

/* ───────────────────────── Red neuronal SVG de fondo ───────────────────────── */
function NeuralBackground() {
  const nodes = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 60; i++) {
      pts.push({ x: Math.random() * 100, y: Math.random() * 100 });
    }
    return pts;
  }, []);

  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 18) {
          result.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y });
        }
      }
    }
    return result;
  }, [nodes]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="currentColor"
          strokeWidth="0.15"
          className="text-orange/20"
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="0.5" fill="currentColor" className="text-orange/30" />
      ))}
    </svg>
  );
}

/* ───────────────────────── Hero de perfil ───────────────────────── */
function ProfileHero({ user, notebooks }: { user: { id: string; email?: string }; notebooks: NotebookRow[] }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [addingInterest, setAddingInterest] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, avatar_url, interests, plan")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data as ProfileRow);
        setNameInput((data as ProfileRow).full_name ?? "");
      }
    })();
  }, [user.id]);

  const totalSources = notebooks.reduce((acc, nb) => acc + nb.documents.length, 0);
  const initials = (profile?.full_name ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const saveName = async () => {
    if (!nameInput.trim()) return;
    await supabase.from("profiles").update({ full_name: nameInput.trim() }).eq("id", user.id);
    setProfile((p) => (p ? { ...p, full_name: nameInput.trim() } : p));
    setEditingName(false);
    toast.success("Nombre actualizado");
  };

  const addInterest = async () => {
    if (!newInterest.trim() || !profile) return;
    const current = profile.interests ?? [];
    if (current.length >= 8) return toast.error("Máximo 8 intereses");
    const updated = [...current, newInterest.trim()];
    await (supabase as any).from("profiles").update({ interests: updated }).eq("id", user.id);
    setProfile((p) => (p ? { ...p, interests: updated } : p));
    setNewInterest("");
    setAddingInterest(false);
  };

  const removeInterest = async (idx: number) => {
    if (!profile) return;
    const updated = (profile.interests ?? []).filter((_, i) => i !== idx);
    await (supabase as any).from("profiles").update({ interests: updated }).eq("id", user.id);
    setProfile((p) => (p ? { ...p, interests: updated } : p));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error("Error al subir la foto");
      setUploadingAvatar(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl + "?t=" + Date.now();
    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
    setProfile((p) => (p ? { ...p, avatar_url: avatarUrl } : p));
    setUploadingAvatar(false);
    toast.success("Foto actualizada");
  };

  const isPro = profile?.plan === "pro" || profile?.plan === "teams";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-paper shadow-soft mb-8 animate-fade-up">
      {/* Fondo red neuronal */}
      <NeuralBackground />

      {/* Gradiente overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-paper/95 via-paper/80 to-cream/60 pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* COLUMNA IZQUIERDA — avatar + info */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-5 md:w-56 shrink-0">
            {/* Avatar */}
            <div className="relative group w-20 h-20 shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border shadow-soft">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange/80 to-orange flex items-center justify-center">
                    <span className="font-display text-2xl font-bold text-paper">{initials}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-2xl bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Cambiar foto"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-paper animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-paper" />
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Nombre + email + plan */}
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="font-display text-lg font-semibold bg-transparent border-b border-orange focus:outline-none text-ink w-full"
                  />
                  <button onClick={saveName} className="text-orange hover:text-orange/70 text-xs font-mono shrink-0">
                    Guardar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="group/name flex items-center gap-1.5 mb-1 text-left"
                >
                  <h2 className="font-display text-xl font-semibold text-ink truncate">
                    {profile?.full_name ?? "Tu nombre"}
                  </h2>
                  <Pencil className="w-3.5 h-3.5 text-ink/30 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
              <p className="text-[12px] text-ink/45 font-mono truncate mb-2">{user.email}</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                  isPro
                    ? "bg-orange/10 text-orange border border-orange/20"
                    : "bg-cream text-ink/50 border border-border"
                }`}
              >
                {isPro && <Star className="w-3 h-3" />}
                {isPro ? "Plan Pro" : "Plan Free"}
              </span>
            </div>
          </div>

          {/* SEPARADOR vertical */}
          <div className="hidden md:block w-px bg-border self-stretch" />

          {/* COLUMNA CENTRAL — intereses */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink/40 mb-3">Intereses</p>
            <div className="flex flex-wrap gap-2">
              {(profile?.interests ?? []).map((interest, i) => (
                <span
                  key={i}
                  className="group/chip inline-flex items-center gap-1 px-3 py-1 bg-cream border border-border rounded-full text-[12.5px] text-ink/70 hover:border-ink/30 transition-colors"
                >
                  {interest}
                  <button
                    onClick={() => void removeInterest(i)}
                    className="text-ink/30 hover:text-destructive transition-colors opacity-0 group-hover/chip:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {addingInterest ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    autoFocus
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void addInterest();
                      if (e.key === "Escape") setAddingInterest(false);
                    }}
                    placeholder="ej: Bioquímica"
                    className="px-3 py-1 bg-paper border border-orange/50 rounded-full text-[12.5px] focus:outline-none focus:ring-1 focus:ring-orange/30 w-32"
                  />
                  <button onClick={addInterest} className="text-orange text-xs font-mono">
                    OK
                  </button>
                  <button onClick={() => setAddingInterest(false)} className="text-ink/30 text-xs">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (profile?.interests ?? []).length < 8 ? (
                <button
                  onClick={() => setAddingInterest(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-border rounded-full text-[12.5px] text-ink/35 hover:border-orange/40 hover:text-orange/60 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Agregar
                </button>
              ) : null}

              {(profile?.interests ?? []).length === 0 && !addingInterest && (
                <p className="text-[12.5px] text-ink/35 italic">Agregá tus áreas de estudio...</p>
              )}
            </div>
          </div>

          {/* SEPARADOR vertical */}
          <div className="hidden md:block w-px bg-border self-stretch" />

          {/* COLUMNA DERECHA — estadísticas */}
          <div className="flex flex-row md:flex-col gap-3 shrink-0">
            {[
              { icon: BookOpen, label: "Cuadernos", value: notebooks.length },
              { icon: FileText, label: "Fuentes", value: totalSources },
              {
                icon: Zap,
                label: "Activos",
                value: notebooks.filter((n) => n.documents.some((d) => d.status === "ready")).length,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center w-20 h-20 bg-cream/60 border border-border rounded-xl"
              >
                <Icon className="w-4 h-4 text-orange mb-1" strokeWidth={1.5} />
                <span className="font-display text-2xl font-bold text-ink leading-none">{value}</span>
                <span className="text-[10px] font-mono text-ink/40 mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
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
        {/* HERO DE PERFIL */}
        <ProfileHero user={user} notebooks={notebooks} />

        {/* BANNER DE UPGRADE */}
        <div className="mt-6 mb-2 animate-fade-up" style={{ animationDelay: "30ms" }}>
          <UpgradeBanner />
        </div>

        {/* TOOLBAR */}
        {!loading && notebooks.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 mb-6 animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            <div className="flex items-center gap-1.5">
              <FilterChip active>Todos</FilterChip>
              <span className="text-[10px] font-mono text-ink/35 ml-1">
                {filtered.length} {filtered.length === 1 ? "cuaderno" : "cuadernos"}
              </span>
            </div>

            <div className="flex items-center gap-2">
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
              <button
                type="button"
                onClick={() => setIconPickerOpen(true)}
                className="group relative shrink-0 p-1 rounded-xl border border-dashed border-border hover:border-orange/50 hover:bg-orange/[0.04] transition-all"
                title="Cambiar icono"
              >
                <ClayIcon icon={pickedIcon} size={64} />
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

/* ───────────────────────── resolveIcon ───────────────────────── */
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

/* ───────────────────────── Notebook Card ───────────────────────── */
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
      className="group relative h-auto min-h-[230px] bg-paper border-2 border-ink flex flex-col overflow-hidden transition-all duration-150 shadow-[4px_4px_0_0_var(--color-ink)] hover:shadow-[7px_7px_0_0_var(--color-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_0_var(--color-ink)] active:translate-x-0 active:translate-y-0"
    >
      {/* Cover bloque sólido con tag tipo etiqueta de archivo */}
      <div className={`relative h-[96px] ${cover.bg} border-b-2 border-ink overflow-hidden`}>
        {/* trama de puntos */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(${cover.accent} 1px, transparent 1px)`,
            backgroundSize: "10px 10px",
          }}
        />
        {/* etiqueta lateral tipo lomo */}
        <div
          className={`absolute top-0 left-4 ${cover.tag} text-paper px-2 pt-1 pb-1.5 text-[9px] font-mono tracking-[0.22em] border-x-2 border-b-2 border-ink`}
        >
          {cover.label}
        </div>
        {/* icono */}
        <div className="absolute top-3 right-3 bg-paper border-2 border-ink p-1.5 shadow-[2px_2px_0_0_var(--color-ink)] group-hover:rotate-[-4deg] transition-transform">
          <ClayIcon icon={resolveIcon(notebook.emoji)} size={36} flat />
        </div>
        {/* badges de estado abajo a la izquierda */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1">
          {processing > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-paper border-2 border-ink text-[9px] font-mono uppercase tracking-wider text-ink">
              <Clock className="w-2.5 h-2.5 animate-pulse" strokeWidth={2.5} /> {processing}
            </span>
          )}
          {errors > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-destructive text-paper border-2 border-ink text-[9px] font-mono uppercase tracking-wider">
              <AlertCircle className="w-2.5 h-2.5" strokeWidth={2.5} /> {errors}
            </span>
          )}
          {ready > 0 && processing === 0 && errors === 0 && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-paper border-2 border-ink text-[9px] font-mono uppercase tracking-wider"
              style={{ backgroundColor: cover.accent }}
            >
              <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2.5} /> {ready}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 pt-3 pb-3.5 min-h-0 bg-paper">
        <h3 className="font-display text-[19px] tracking-tight text-ink line-clamp-2 leading-[1.1]">
          {notebook.title}
        </h3>
        {notebook.description && (
          <p className="text-[12px] text-ink/60 mt-1 line-clamp-1 leading-relaxed">{notebook.description}</p>
        )}
        {ready > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5" onClick={(e) => e.stopPropagation()}>
            {readyDocs.slice(0, 3).map((d) => (
              <Link
                key={d.id}
                to="/document/$id"
                params={{ id: d.id }}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-cream border border-ink/60 text-[11px] font-mono hover:bg-ink hover:text-paper transition-colors truncate max-w-[130px]"
                title={d.title}
              >
                {d.title}
              </Link>
            ))}
            {ready > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-ink/55">
                +{ready - 3}
              </span>
            )}
          </div>
        )}
        {ready === 0 && processing > 0 && (
          <p className="text-xs text-ink/55 mt-2.5 inline-flex items-center gap-1 font-mono">
            <Loader2 className="w-3 h-3 animate-spin" /> PROCESANDO...
          </p>
        )}
        {total === 0 && (
          <span className="text-[11px] text-ink/55 mt-2.5 font-mono uppercase tracking-wider">
            Subí tu primer material →
          </span>
        )}
        <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] font-mono text-ink/50 uppercase tracking-[0.15em] border-t border-dashed border-ink/20">
          <span className="pt-1.5">{relativeDate(notebook.created_at)}</span>
          <span className="text-ink/20 pt-1.5">·</span>
          <span className="pt-1.5">
            {total} {total === 1 ? "fuente" : "fuentes"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ───────────────────────── Notebook Row ───────────────────────── */
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
