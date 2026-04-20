import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, FileText as FileIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { TemplatePicker } from "@/components/editor/TemplatePicker";
import { createNote, listNotesByNotebook, deleteNote, type NoteRow } from "@/lib/notes";
import type { NoteTemplate } from "@/lib/note-templates";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

interface Props {
  notebookId: string;
  documentId?: string | null;
}

export function NotesList({ notebookId, documentId = null }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    void load();
  }, [notebookId]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listNotesByNotebook(notebookId);
      setNotes(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar notas");
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async (tpl: NoteTemplate) => {
    if (!user) return;
    setPickerOpen(false);
    try {
      const built = tpl.build({ title: "" });
      const note = await createNote({
        userId: user.id,
        notebookId,
        documentId,
        title: built.title,
        contentHtml: built.html,
        contentJson: {},
        templateKey: tpl.key,
        emoji: tpl.emoji,
        coverColor: tpl.cover_color,
      });
      navigate({ to: "/editor/$id", params: { id: note.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear nota");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    try {
      await deleteNote(id);
      setNotes((ns) => ns.filter((n) => n.id !== id));
      toast.success("Nota eliminada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Notas editables</h2>
          <p className="text-xs text-ink/50 mt-1">
            Tu lienzo personal: armá resúmenes, cheat-sheets o cualquier formato que necesites.
          </p>
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95 rounded-md"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2} />
          Nueva nota
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-ink/40" />
        </div>
      ) : notes.length === 0 ? (
        <div className="border-2 border-dashed border-border py-14 text-center bg-cream/20 rounded-md">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-paper border border-border rounded-md">
            <FileIcon className="w-5 h-5 text-ink/40" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Sin notas todavía</h3>
          <p className="text-sm text-ink/60 max-w-sm mx-auto mb-5">
            Creá tu primera nota desde un template o desde un lienzo en blanco.
          </p>
          <button
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all rounded-md"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Crear primera nota
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {notes.map((n) => (
            <div key={n.id} className="group relative">
              <Link
                to="/editor/$id"
                params={{ id: n.id }}
                className="block bg-paper border border-border p-5 hover:border-ink hover:shadow-elevated hover:-translate-y-0.5 transition-all rounded-md overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-orange opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-2xl mb-3 leading-none">{n.emoji ?? "📝"}</div>
                <h3 className="font-display text-lg font-semibold text-ink mb-1.5 line-clamp-2 leading-tight">
                  {n.title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono text-ink/40">
                  <span>{n.word_count} palabras</span>
                  <span>·</span>
                  <span>
                    {new Date(n.updated_at).toLocaleDateString("es", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(n.id)}
                className="absolute top-3 right-3 p-1.5 text-ink/30 hover:text-destructive hover:bg-destructive/5 transition-all opacity-0 group-hover:opacity-100 rounded-md"
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}

      <TemplatePicker open={pickerOpen} onPick={handlePick} onClose={() => setPickerOpen(false)} />
    </div>
  );
}
