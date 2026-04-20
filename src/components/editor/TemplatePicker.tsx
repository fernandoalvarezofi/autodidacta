import { Sparkles, X } from "lucide-react";
import { NOTE_TEMPLATES, type NoteTemplate } from "@/lib/note-templates";

interface TemplatePickerProps {
  open: boolean;
  onPick: (tpl: NoteTemplate) => void;
  onClose: () => void;
}

export function TemplatePicker({ open, onPick, onClose }: TemplatePickerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-paper border border-ink/20 shadow-elevated animate-scale-in rounded-md">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-paper/95 backdrop-blur-xl border-b border-border">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-orange font-mono mb-1">
              Nueva nota
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Elegí un punto de partida
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink/40 hover:text-ink hover:bg-cream/60 transition-all rounded-md"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
          {NOTE_TEMPLATES.map((tpl, i) => (
            <button
              key={tpl.key}
              onClick={() => onPick(tpl)}
              className="group relative text-left p-5 bg-paper border border-border hover:border-ink hover:shadow-elevated hover:-translate-y-0.5 transition-all overflow-hidden rounded-md animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-orange opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl mb-3 leading-none">{tpl.emoji}</div>
              <h3 className="font-display text-lg font-semibold text-ink mb-1.5 leading-tight">
                {tpl.name}
              </h3>
              <p className="text-xs text-ink/60 leading-relaxed">{tpl.description}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono text-ink/40 group-hover:text-orange transition-colors">
                <Sparkles className="w-3 h-3" strokeWidth={2} />
                Usar template
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
