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

  return (
    <DashboardShell>
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-12">
        <div className="flex items-end justify-between mb-12 pb-6 border-b-2 border-ink">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-3">
              Tu biblioteca
            </p>
            <h1 className="font-display text-5xl font-semibold tracking-tight">Cuadernos</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-ink text-paper hover:bg-ink/90 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Nuevo cuaderno
          </button>
        </div>

        <GamificationWidget />

        {showCreate && (
          <div className="mb-10 border border-ink bg-cream/40 p-6">
            <h2 className="font-display text-xl mb-4">Nuevo cuaderno</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título (ej: Anatomía II)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-paper border border-border focus:border-ink focus:outline-none transition-colors"
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-paper border border-border focus:border-ink focus:outline-none transition-colors resize-none"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm border border-border hover:border-ink transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !title.trim()}
                  className="px-4 py-2 text-sm bg-ink text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {notebooks.map((nb) => (
              <NotebookCard key={nb.id} notebook={nb} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
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
      className="group bg-paper p-6 hover:bg-cream/40 transition-colors flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs uppercase tracking-wider font-mono text-ink/40">
          {new Date(notebook.created_at).toLocaleDateString("es", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        <FileText className="w-4 h-4 text-ink/30 group-hover:text-orange transition-colors" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-2xl font-semibold tracking-tight text-ink mb-2 line-clamp-2">
        {notebook.title}
      </h3>
      {notebook.description && (
        <p className="text-sm text-ink/60 mb-4 line-clamp-2">{notebook.description}</p>
      )}
      <div className="mt-auto pt-4 border-t border-border flex items-center gap-4 text-xs font-mono">
        <span className="text-ink/60">
          {total} {total === 1 ? "documento" : "documentos"}
        </span>
        {ready > 0 && (
          <span className="flex items-center gap-1 text-orange">
            <CheckCircle2 className="w-3 h-3" /> {ready}
          </span>
        )}
        {processing > 0 && (
          <span className="flex items-center gap-1 text-ink/60">
            <Clock className="w-3 h-3" /> {processing}
          </span>
        )}
        {errors > 0 && (
          <span className="flex items-center gap-1 text-destructive">
            <AlertCircle className="w-3 h-3" /> {errors}
          </span>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="border border-dashed border-border py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 border border-border mb-6">
        <FileText className="w-7 h-7 text-ink/40" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-2xl font-semibold mb-2">Tu biblioteca está vacía</h3>
      <p className="text-sm text-ink/60 mb-6 max-w-sm mx-auto">
        Creá tu primer cuaderno y empezá a transformar PDFs en herramientas de estudio activas.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-ink text-paper hover:bg-ink/90 transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
        Crear cuaderno
      </button>
    </div>
  );
}
