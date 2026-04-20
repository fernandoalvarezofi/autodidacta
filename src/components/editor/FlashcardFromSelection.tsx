import { useEffect, useState } from "react";
import { Layers, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  initialFront: string;
  userId: string;
  notebookId: string | null;
  documentId: string | null;
  onClose: () => void;
  onCreated?: () => void;
}

export function FlashcardFromSelection({
  open,
  initialFront,
  userId,
  notebookId,
  documentId,
  onClose,
  onCreated,
}: Props) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFront(initialFront.slice(0, 200));
      setBack("");
    }
  }, [open, initialFront]);

  const save = async () => {
    if (!front.trim() || !back.trim()) {
      toast.error("Completá frente y dorso");
      return;
    }
    if (!notebookId) {
      toast.error("La nota no está vinculada a un cuaderno");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("flashcards").insert({
      user_id: userId,
      notebook_id: notebookId,
      document_id: documentId,
      front: front.trim(),
      back: back.trim(),
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Flashcard creada");
    onCreated?.();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-paper border border-ink/20 shadow-elevated animate-scale-in rounded-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 inline-flex items-center justify-center bg-gradient-orange rounded-md shadow-orange">
              <Layers className="w-4 h-4 text-paper" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-orange font-mono">
                Nueva flashcard
              </p>
              <h3 className="font-display text-lg font-semibold leading-tight">
                Convertir selección
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink/40 hover:text-ink hover:bg-cream/60 transition-all rounded-md"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-ink/50 mb-2">
              Frente — pregunta o concepto
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-cream/30 border border-border focus:border-ink focus:bg-paper focus:outline-none text-sm resize-none rounded-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-ink/50 mb-2">
              Dorso — respuesta o explicación
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={4}
              placeholder="Escribí la respuesta…"
              className="w-full px-3.5 py-2.5 bg-cream/30 border border-border focus:border-ink focus:bg-paper focus:outline-none text-sm resize-none rounded-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-cream/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border hover:border-ink hover:bg-paper transition-all rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving || !front.trim() || !back.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange disabled:opacity-50 disabled:hover:shadow-none transition-all rounded-md"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            Crear flashcard
          </button>
        </div>
      </div>
    </div>
  );
}
