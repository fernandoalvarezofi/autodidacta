import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NoteEditor } from "@/components/editor/NoteEditor";
import type { NoteRow } from "@/lib/notes";
import { toast } from "sonner";

export const Route = createFileRoute("/editor/$id")({
  component: EditorPage,
});

interface NotebookMini {
  id: string;
  title: string;
}

function EditorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [note, setNote] = useState<NoteRow | null>(null);
  const [notebook, setNotebook] = useState<NotebookMini | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast.error("Nota no encontrada");
        navigate({ to: "/dashboard" });
        return;
      }
      setNote(data as NoteRow);
      if (data.notebook_id) {
        const { data: nb } = await supabase
          .from("notebooks")
          .select("id, title")
          .eq("id", data.notebook_id)
          .maybeSingle();
        if (nb) setNotebook(nb as NotebookMini);
      }
      setLoading(false);
    })();
  }, [user, id, navigate]);

  if (authLoading || loading || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-ink/40 mb-6 animate-fade-in">
          <Link
            to="/dashboard"
            className="hover:text-orange transition-colors inline-flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2} />
            Biblioteca
          </Link>
          {notebook && (
            <>
              <span className="text-ink/25">/</span>
              <Link
                to="/notebook/$id"
                params={{ id: notebook.id }}
                className="hover:text-orange transition-colors truncate max-w-[180px]"
              >
                {notebook.title}
              </Link>
            </>
          )}
          <span className="text-ink/25">/</span>
          <span className="text-ink/60 inline-flex items-center gap-1.5">
            <span className="w-1 h-1 bg-orange rounded-full animate-pulse" />
            Editor
          </span>
        </nav>

        {user && <NoteEditor note={note} userId={user.id} onDeleted={() => navigate({ to: "/dashboard" })} />}
      </div>
    </DashboardShell>
  );
}
