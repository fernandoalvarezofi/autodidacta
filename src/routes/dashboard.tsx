import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, FileText, Clock, CheckCircle2, AlertCircle, Sparkles, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GamificationWidget } from "@/components/dashboard/GamificationWidget";
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

function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notebooks, setNotebooks] = useState<NotebookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("notebooks")
        .select("id, title, description, emoji, created_at, documents(id, status)")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Error al cargar cuadernos");
      } else {
        setNotebooks((data ?? []) as NotebookRow[]);
      }
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
      <div className="container mx-auto px-5 lg:px-8 max-w-[1240px] py-10 relative">
        {/* Subtle grid background */}
        <div className="absolute inset-x-0 top-0 h-[400px] bg-grid-fade -z-10 pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 animate-fade-up">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-orange rounded-full shadow-[0_0_8px_var(--orange)]" />
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink/45 font-mono">
                {greeting}, {niceName}
              </p>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
              Tu biblioteca
            </h1>
            <p className="text-ink/55 mt-2.5 max-w-xl text-[14.5px] leading-relaxed">
              Cada cuaderno es un universo de estudio. Subí material, generá flashcards y conversá con tus apuntes.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="group inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium bg-ink text-paper hover:bg-orange transition-colors active:scale-[0.98] self-start md:self-auto rounded-md whitespace-nowrap shadow-soft"
          >
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.25} />
            Nuevo cuaderno
          </button>
        </div>

        <div className="animate-fade-up mb-10" style={{ animationDelay: "80ms" }}>
          <GamificationWidget />
        </div>

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
                  onClick={() => setShowCreate(false)}
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

        {/* Section header */}
        {!loading && notebooks.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[11px] font-mono uppercase tracking-[0.22em] text-ink/55">
                Cuadernos
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cream border border-border rounded text-ink/60">
                {notebooks.length}
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-ink/40" />
          </div>
        ) : notebooks.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
            {notebooks.map((nb) => (
              <NotebookCard key={nb.id} notebook={nb} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Madrugada";
  if (h < 12) return "Buen día";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function NotebookCard({ notebook }: { notebook: NotebookRow }) {
  const total = notebook.documents.length;
  const ready = notebook.documents.filter((d) => d.status === "ready").length;
  const processing = notebook.documents.filter((d) =>
    ["pending", "processing", "chunked", "generating"].includes(d.status),
  ).length;
  const errors = notebook.documents.filter((d) => d.status === "error").length;

  return (
    <Link
      to="/notebook/$id"
      params={{ id: notebook.id }}
      className="group relative bg-cream/40 hover:bg-cream/80 border border-border hover:border-ink/25 p-5 transition-all flex flex-col overflow-hidden rounded-lg"
    >
      {/* Hover glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-4">
        <div className="w-8 h-8 inline-flex items-center justify-center bg-paper border border-border group-hover:border-orange/40 group-hover:bg-orange/10 transition-all rounded-md">
          <FileText
            className="w-3.5 h-3.5 text-ink/50 group-hover:text-orange transition-colors"
            strokeWidth={1.75}
          />
        </div>
        <ArrowUpRight
          className="w-4 h-4 text-ink/25 group-hover:text-orange group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
          strokeWidth={2}
        />
      </div>

      <h3 className="font-display text-[17px] font-semibold tracking-tight text-ink mb-1.5 line-clamp-2 leading-snug">
        {notebook.title}
      </h3>
      {notebook.description ? (
        <p className="text-[13px] text-ink/55 mb-4 line-clamp-2 leading-relaxed">
          {notebook.description}
        </p>
      ) : (
        <p className="text-[13px] text-ink/30 italic mb-4">Sin descripción</p>
      )}

      <div className="mt-auto pt-3 border-t border-border/60 flex items-center gap-3 text-[11px] font-mono">
        <span className="text-ink/50">
          {total} {total === 1 ? "doc" : "docs"}
        </span>
        <span className="text-ink/25">·</span>
        <span className="text-ink/40 truncate">
          {new Date(notebook.created_at).toLocaleDateString("es", {
            day: "2-digit",
            month: "short",
          })}
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          {ready > 0 && (
            <span
              className="inline-flex items-center gap-0.5 text-orange-deep"
              title={`${ready} listos`}
            >
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} /> {ready}
            </span>
          )}
          {processing > 0 && (
            <span
              className="inline-flex items-center gap-0.5 text-ink/45"
              title={`${processing} procesando`}
            >
              <Clock className="w-3 h-3 animate-pulse" strokeWidth={2.5} /> {processing}
            </span>
          )}
          {errors > 0 && (
            <span
              className="inline-flex items-center gap-0.5 text-destructive"
              title={`${errors} con error`}
            >
              <AlertCircle className="w-3 h-3" strokeWidth={2.5} /> {errors}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
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
