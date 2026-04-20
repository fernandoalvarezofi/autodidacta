// Templates didácticos insertables vía slash command (/) o botón + lateral.
// Cada template devuelve un fragmento HTML que se inserta en la posición del cursor.
import type { Editor } from "@tiptap/react";
import { BookOpen, HelpCircle, FileText, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SlashCommand {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  keywords: string[]; // para fuzzy matching
  /** HTML que se inserta en la posición del cursor */
  insert: (editor: Editor) => void;
}

const insertHtml = (editor: Editor, html: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (editor.chain().focus() as any).insertContent(html).run();
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    key: "definicion",
    label: "Definición",
    description: "Caja para anotar un término y su significado",
    icon: BookOpen,
    keywords: ["definicion", "definir", "termino", "concepto", "glosario"],
    insert: (editor) => {
      insertHtml(
        editor,
        `<div data-callout="definition" class="note-callout note-callout--definition"><p><strong>Definición —</strong> Escribí el término y su significado acá.</p></div><p></p>`,
      );
    },
  },
  {
    key: "pregunta",
    label: "Pregunta",
    description: "Plantear una duda para retomar después",
    icon: HelpCircle,
    keywords: ["pregunta", "duda", "cuestion", "que", "porque"],
    insert: (editor) => {
      insertHtml(
        editor,
        `<div data-callout="question" class="note-callout note-callout--question"><p><strong>¿Pregunta?</strong> Anotá tu duda — la podés llevar al chat.</p></div><p></p>`,
      );
    },
  },
  {
    key: "resumen",
    label: "Resumen",
    description: "Síntesis de lo más importante de la sección",
    icon: FileText,
    keywords: ["resumen", "sintesis", "summary", "tldr", "clave"],
    insert: (editor) => {
      insertHtml(
        editor,
        `<div data-callout="summary" class="note-callout note-callout--summary"><p><strong>📝 Resumen</strong></p><ul><li>Punto clave uno</li><li>Punto clave dos</li><li>Punto clave tres</li></ul></div><p></p>`,
      );
    },
  },
  {
    key: "ejemplo",
    label: "Ejemplo",
    description: "Caso concreto que ilustra el concepto",
    icon: Lightbulb,
    keywords: ["ejemplo", "caso", "ilustracion", "muestra", "ej"],
    insert: (editor) => {
      insertHtml(
        editor,
        `<div data-callout="example" class="note-callout note-callout--example"><p><strong>💡 Ejemplo</strong> — Describí un caso concreto que ilustre el concepto.</p></div><p></p>`,
      );
    },
  },
];

/**
 * Filtra comandos por query (fuzzy: substring + keywords).
 * Devuelve resultados ordenados por relevancia.
 */
export function filterCommands(query: string): SlashCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_COMMANDS;
  return SLASH_COMMANDS.map((c) => {
    const labelMatch = c.label.toLowerCase().includes(q);
    const keyMatch = c.key.includes(q);
    const kwMatch = c.keywords.some((k) => k.includes(q));
    const descMatch = c.description.toLowerCase().includes(q);
    let score = 0;
    if (c.label.toLowerCase().startsWith(q)) score += 10;
    if (labelMatch) score += 5;
    if (keyMatch) score += 4;
    if (kwMatch) score += 3;
    if (descMatch) score += 1;
    return { cmd: c, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ cmd }) => cmd);
}
