import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { type SlashCommand, filterCommands } from "@/lib/slash-commands";

interface Props {
  editor: Editor;
  open: boolean;
  query: string;
  position: { top: number; left: number } | null;
  /** Caracteres a borrar antes de insertar el comando (la `/` y el query tipeado). */
  charsToDelete: number;
  onClose: () => void;
}

export function SlashCommandMenu({
  editor,
  open,
  query,
  position,
  charsToDelete,
  onClose,
}: Props) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const results = filterCommands(query);

  // Reset active index when query changes
  useEffect(() => {
    setActive(0);
  }, [query]);

  // Keyboard navigation — listen at document level since TipTap owns focus
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (!results.length) {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + results.length) % results.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        runCommand(results[active]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, active]);

  const runCommand = (cmd: SlashCommand) => {
    // Borrar el "/" + query tipeado antes de insertar
    if (charsToDelete > 0) {
      const { from } = editor.state.selection;
      editor
        .chain()
        .focus()
        .deleteRange({ from: from - charsToDelete, to: from })
        .run();
    }
    cmd.insert(editor);
    onClose();
  };

  if (!open || !position) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-72 bg-paper border border-border shadow-elevated rounded-lg overflow-hidden animate-fade-in"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-3 py-2 border-b border-border bg-cream/40">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/50">
          Insertar bloque {query && <span className="text-orange-deep">· {query}</span>}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="px-3 py-6 text-center">
          <p className="text-sm text-ink/50">Sin resultados</p>
          <p className="text-[11px] text-ink/40 mt-1">Probá "definicion", "pregunta", "resumen"…</p>
        </div>
      ) : (
        <ul className="py-1 max-h-72 overflow-y-auto">
          {results.map((cmd, i) => {
            const Icon = cmd.icon;
            const isActive = i === active;
            return (
              <li key={cmd.key}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => runCommand(cmd)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    isActive ? "bg-cream/80" : "hover:bg-cream/40"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0 transition-colors ${
                      isActive
                        ? "bg-gradient-orange text-paper shadow-orange"
                        : "bg-cream border border-border text-ink/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink leading-tight">
                      {cmd.label}
                    </span>
                    <span className="block text-[11px] text-ink/55 leading-tight mt-0.5 truncate">
                      {cmd.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="px-3 py-1.5 border-t border-border bg-cream/30 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-ink/40">
        <span>↑↓ navegar</span>
        <span>↵ insertar</span>
        <span>esc cerrar</span>
      </div>
    </div>
  );
}
