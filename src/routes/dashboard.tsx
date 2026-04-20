import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
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
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  const greeting = getGreeting();
  const firstName = (user.email ?? "").split("@")[0]?.split(/[._-]/)[0] ?? "";
  const niceName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : "estudiante";

  return (
    <DashboardShell>
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-12 relative">
        {/* Decorative radial glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] -z-10 opacity-50 bg-radial-orange pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 pb-8 border-b-2 border-ink animate-fade-up">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-1.5 h-1.5 bg-orange rounded-full animate-pulse" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-orange font-mono">
                {greeting}, {niceName}
              </p>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              Tu biblioteca
            </h1>
            <p className="text-ink/60 mt-3 max-w-xl leading-relaxed">
              Cada cuaderno es un universo de estudio. Subí material, generá flashcards, jugá quizzes
              y conversá con tus apuntes.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="group inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95 self-start md:self-auto rounded-md whitespace-nowrap"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2} />
            Nuevo cuaderno
          </button>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <GamificationWidget />
        </div>

        {showCreate && (
          <div className="mb-10 border-2 border-ink bg-paper p-6 md:p-7 shadow-elevated animate-scale-in">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-orange font-mono mb-1.5">
                  Crear
                </p>
                <h2 className="font-display text-2xl">Nuevo cuaderno</h2>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título (ej: Anatomía II)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 bg-cream/30 border border-border focus:border-ink focus:bg-paper focus:outline-none transition-all font-display text-lg"
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-cream/30 border border-border focus:border-ink focus:bg-paper focus:outline-none transition-all resize-none text-sm"
              />
              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 text-sm border border-border hover:border-ink hover:bg-cream/60 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !title.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange disabled:opacity-50 disabled:hover:shadow-none transition-all"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuaderno"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
          </div>
        ) : notebooks.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
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
      className="group relative bg-paper border border-border p-6 hover:border-ink hover:shadow-elevated hover:-translate-y-1 transition-all flex flex-col overflow-hidden"
    >
      {/* Subtle orange accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-orange opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink/40">
          {new Date(notebook.created_at).toLocaleDateString("es", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        <div className="w-7 h-7 inline-flex items-center justify-center border border-border group-hover:border-orange group-hover:bg-orange/5 transition-all">
          <FileText
            className="w-3.5 h-3.5 text-ink/40 group-hover:text-orange transition-colors"
            strokeWidth={1.75}
          />
        </div>
      </div>
      <h3 className="font-display text-2xl font-semibold tracking-tight text-ink mb-2 line-clamp-2 leading-snug">
        {notebook.title}
      </h3>
      {notebook.description && (
        <p className="text-sm text-ink/60 mb-4 line-clamp-2 leading-relaxed">
          {notebook.description}
        </p>
      )}
      <div className="mt-auto pt-4 border-t border-border flex items-center gap-3 text-xs font-mono">
        <span className="text-ink/60">
          {total} {total === 1 ? "documento" : "documentos"}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          {ready > 0 && (
            <span
              className="inline-flex items-center gap-1 text-orange-deep"
              title={`${ready} listos`}
            >
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} /> {ready}
            </span>
          )}
          {processing > 0 && (
            <span
              className="inline-flex items-center gap-1 text-ink/50"
              title={`${processing} procesando`}
            >
              <Clock className="w-3 h-3 animate-pulse" strokeWidth={2.5} /> {processing}
            </span>
          )}
          {errors > 0 && (
            <span
              className="inline-flex items-center gap-1 text-destructive"
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
    <div className="border-2 border-dashed border-border py-20 text-center bg-cream/20 animate-fade-up">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-orange shadow-orange rounded-full mb-6 animate-pulse-glow">
        <FileText className="w-7 h-7 text-paper" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-3xl font-semibold mb-3">Tu biblioteca está vacía</h3>
      <p className="text-sm text-ink/60 mb-6 max-w-sm mx-auto leading-relaxed">
        Creá tu primer cuaderno y empezá a transformar PDFs en herramientas de estudio activas.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
        Crear cuaderno
      </button>
    </div>
  );
}
