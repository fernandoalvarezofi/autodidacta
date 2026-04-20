import { useEffect, useRef, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";

interface SlashState {
  open: boolean;
  query: string;
  position: { top: number; left: number } | null;
  charsToDelete: number;
  /** Posición del documento donde empieza la "/" — para validar que sigue en la misma sesión */
  startPos: number;
}

const initial: SlashState = {
  open: false,
  query: "",
  position: null,
  charsToDelete: 0,
  startPos: 0,
};

/**
 * Detecta cuando el usuario escribe `/` al inicio de un bloque o después de un espacio,
 * y abre un menú flotante con comandos. Mientras se mantiene abierto, va capturando
 * el query (texto después del `/`) hasta que se borra el `/`, se presiona escape,
 * o se selecciona un comando.
 */
export function useSlashCommands(editor: Editor | null) {
  const [state, setState] = useState<SlashState>(initial);
  const stateRef = useRef(state);
  stateRef.current = state;

  const close = useCallback(() => {
    setState(initial);
  }, []);

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const current = stateRef.current;
      const { selection, doc } = editor.state;
      const { from } = selection;

      // Si hay menú abierto, ver si seguimos válidos
      if (current.open) {
        // Validar que el cursor sigue después de startPos
        if (from <= current.startPos) {
          close();
          return;
        }
        const text = doc.textBetween(current.startPos, from, "\n", "\n");
        // Si borrar el "/", cerrar
        if (!text.startsWith("/")) {
          close();
          return;
        }
        // Si hay un espacio en el query, cerrar (no es slash command)
        const queryRaw = text.slice(1);
        if (queryRaw.includes(" ") || queryRaw.includes("\n")) {
          close();
          return;
        }
        setState((s) => ({
          ...s,
          query: queryRaw,
          charsToDelete: text.length,
        }));
        return;
      }

      // Detectar apertura: el último char tipeado es "/" y está al inicio
      // de un bloque o después de un espacio.
      if (from < 1) return;
      const prevChar = doc.textBetween(from - 1, from, "\n", "\n");
      if (prevChar !== "/") return;

      // Verificar que la posición anterior es inicio de bloque o espacio
      let isValidStart = from === 1;
      if (!isValidStart && from >= 2) {
        const charBefore = doc.textBetween(from - 2, from - 1, "\n", "\n");
        isValidStart = charBefore === " " || charBefore === "\n" || charBefore === "";
      }
      // También válido si es justo el comienzo de un nodo (heading, paragraph nuevo)
      if (!isValidStart) {
        const $from = selection.$from;
        if ($from.parentOffset === 1) {
          isValidStart = true;
        }
      }

      if (!isValidStart) return;

      // Calcular posición del menú a partir de las coordenadas del cursor
      try {
        const coords = editor.view.coordsAtPos(from);
        // Posicionar debajo del cursor con un pequeño offset
        const top = coords.bottom + 6;
        const left = coords.left;
        // Mantener dentro del viewport
        const adjLeft = Math.min(left, window.innerWidth - 300);
        const adjTop = Math.min(top, window.innerHeight - 320);
        setState({
          open: true,
          query: "",
          position: { top: adjTop, left: adjLeft },
          charsToDelete: 1,
          startPos: from - 1,
        });
      } catch {
        // si falla coordsAtPos, ignorar
      }
    };

    editor.on("update", updateMenu);
    editor.on("selectionUpdate", updateMenu);

    return () => {
      editor.off("update", updateMenu);
      editor.off("selectionUpdate", updateMenu);
    };
  }, [editor, close]);

  const openAt = useCallback(
    (pos: number, coords: { top: number; left: number }) => {
      if (!editor) return;
      // Posicionar cursor al final del bloque y abrir menú sin "/"
      editor.chain().focus().setTextSelection(pos).run();
      const adjLeft = Math.min(coords.left, window.innerWidth - 300);
      const adjTop = Math.min(coords.top, window.innerHeight - 320);
      setState({
        open: true,
        query: "",
        position: { top: adjTop, left: adjLeft },
        charsToDelete: 0,
        startPos: pos,
      });
    },
    [editor],
  );

  return {
    open: state.open,
    query: state.query,
    position: state.position,
    charsToDelete: state.charsToDelete,
    close,
    openAt,
  };
}
