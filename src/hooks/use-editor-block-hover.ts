import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

interface LineHover {
  /** Posición top relativa al contenedor del editor */
  top: number;
  /** Posición top absoluta en viewport para el menú flotante */
  viewportTop: number;
  /** Posición left absoluta en viewport para el menú flotante */
  viewportLeft: number;
  /** Posición de documento del bloque (para insertar al final) */
  blockEndPos: number;
}

/**
 * Detecta el bloque vacío más cercano al cursor del mouse y devuelve su posición
 * para mostrar un botón "+" en el margen izquierdo.
 *
 * Solo aparece cuando el bloque hovereado es un párrafo vacío.
 */
export function useEditorBlockHover(editor: Editor | null, containerRef: React.RefObject<HTMLElement>) {
  const [hover, setHover] = useState<LineHover | null>(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!editor || !containerRef.current) return;
    const container = containerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle ~30fps
      const now = Date.now();
      if (now - lastUpdateRef.current < 32) return;
      lastUpdateRef.current = now;

      try {
        const view = editor.view;
        const pos = view.posAtCoords({ left: e.clientX, top: e.clientY });
        if (!pos) {
          setHover(null);
          return;
        }
        const $pos = view.state.doc.resolve(pos.pos);
        const node = $pos.parent;
        // Solo párrafos vacíos
        if (node.type.name !== "paragraph" || node.content.size > 0) {
          setHover(null);
          return;
        }
        // Coordenadas del bloque
        const blockStartPos = $pos.start($pos.depth);
        const coords = view.coordsAtPos(blockStartPos);
        const containerRect = container.getBoundingClientRect();
        setHover({
          top: coords.top - containerRect.top,
          viewportTop: coords.top + 2,
          viewportLeft: coords.left,
          blockEndPos: $pos.end($pos.depth),
        });
      } catch {
        setHover(null);
      }
    };

    const handleMouseLeave = () => setHover(null);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [editor, containerRef]);

  return { hover, clear: () => setHover(null) };
}
