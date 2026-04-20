import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Image as ImageIcon,
  FileText,
  Layers as LayersIcon,
  Trash2,
  CheckCheck,
  Highlighter,
  Quote as QuoteIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Plus,
} from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { FlashcardFromSelection } from "./FlashcardFromSelection";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { useSlashCommands } from "@/hooks/use-slash-commands";
import { useEditorBlockHover } from "@/hooks/use-editor-block-hover";
import { updateNote, deleteNote, type NoteRow } from "@/lib/notes";
import { exportNoteAsPng, safeFilename } from "@/lib/note-export";
import { ExportButton } from "@/components/ui/ExportButton";
import { toast } from "sonner";

interface NoteEditorProps {
  note: NoteRow;
  userId: string;
  onDeleted?: () => void;
}

const COVER_COLORS: Record<string, string> = {
  cream: "bg-cream",
  orange: "bg-orange/15",
  ink: "bg-ink/5",
};

export function NoteEditor({ note, userId, onDeleted }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [emoji, setEmoji] = useState(note.emoji ?? "📝");
  const [cover, setCover] = useState(note.cover_color ?? "cream");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("saved");
  const [exporting, setExporting] = useState<"png" | null>(null);
  const [flashOpen, setFlashOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  const saveTimer = useRef<number | null>(null);
  const lastSaved = useRef({ title: note.title, html: note.content_html });
  const sheetRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Empezá a escribir, pegá texto o usá la barra superior…",
      }),
      Highlight.configure({ multicolor: false }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "underline text-orange" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
    ],
    content: note.content_html || "<p></p>",
    editorProps: {
      attributes: {
        class: "tiptap-content focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      scheduleSave(editor.getHTML(), editor.getJSON());
    },
  });

  const slash = useSlashCommands(editor);
  const { hover: blockHover, clear: clearBlockHover } = useEditorBlockHover(
    editor,
    editorContainerRef,
  );

  // Title autosave (separate from body)
  useEffect(() => {
    if (title === lastSaved.current.title) return;
    setSaveState("saving");
    const t = window.setTimeout(async () => {
      try {
        await updateNote(note.id, { title: title.trim() || "Nota sin título" });
        lastSaved.current.title = title;
        setSaveState("saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al guardar");
        setSaveState("idle");
      }
    }, 700);
    return () => window.clearTimeout(t);
  }, [title, note.id]);

  // Emoji + cover changes save inmediately
  useEffect(() => {
    if (emoji === note.emoji && cover === note.cover_color) return;
    void updateNote(note.id, { emoji, cover_color: cover });
  }, [emoji, cover, note.id, note.emoji, note.cover_color]);

  function scheduleSave(html: string, json: unknown) {
    if (html === lastSaved.current.html) return;
    setSaveState("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        await updateNote(note.id, { content_html: html, content_json: json });
        lastSaved.current.html = html;
        setSaveState("saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al guardar");
        setSaveState("idle");
      }
    }, 900);
  }

  const handleExportPng = async () => {
    if (!sheetRef.current) return;
    setExporting("png");
    try {
      await exportNoteAsPng(sheetRef.current, safeFilename(title));
      toast.success("PNG descargado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al exportar PNG");
    } finally {
      setExporting(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta nota? No se puede deshacer.")) return;
    try {
      await deleteNote(note.id);
      toast.success("Nota eliminada");
      onDeleted?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  const wordCount = editor?.storage.characterCount?.words?.() ?? note.word_count;

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-ink/50">
          <SaveIndicator state={saveState} />
          <span className="text-ink/25">·</span>
          <span>{wordCount} palabras</span>
        </div>
        <div className="flex items-center gap-2">
          <ColorPicker value={cover} onChange={setCover} />
          <button
            onClick={handleExportPng}
            disabled={!!exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border hover:border-ink hover:bg-cream/60 transition-all disabled:opacity-50 rounded-md"
          >
            {exporting === "png" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
            )}
            PNG
          </button>
          <ExportButton
            title={title}
            filename={safeFilename(title)}
            label="Descargar"
            content={{ kind: "html", html: editor?.getHTML() ?? "" }}
          />
          <button
            onClick={handleDelete}
            className="p-2 text-ink/30 hover:text-destructive hover:bg-destructive/5 transition-all rounded-md"
            title="Eliminar nota"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <EditorToolbar editor={editor} />

      {/* The "paper sheet" that gets exported */}
      <div
        ref={sheetRef}
        className={`relative ${COVER_COLORS[cover] ?? "bg-cream"} transition-colors duration-500`}
      >
        <div className="bg-paper shadow-elevated mx-auto" style={{ maxWidth: 880 }}>
          {/* Cover header */}
          <div className={`relative px-10 pt-12 pb-8 ${COVER_COLORS[cover] ?? "bg-cream"}`}>
            <div className="absolute top-0 right-0 w-[300px] h-[200px] -z-0 opacity-50 bg-radial-orange pointer-events-none" />
            <div className="relative">
              <button
                onClick={() => setEmoji(prompt("Nuevo emoji", emoji) || emoji)}
                className="text-5xl mb-4 leading-none hover:scale-110 transition-transform inline-block"
                title="Cambiar emoji"
              >
                {emoji}
              </button>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la nota"
                className="w-full font-display text-4xl md:text-5xl font-semibold tracking-tight bg-transparent focus:outline-none placeholder-ink/30 leading-[1.05]"
              />
              <p className="text-[11px] uppercase tracking-[0.2em] font-mono text-ink/40 mt-3">
                Editado {new Date(note.updated_at).toLocaleDateString("es", {
                  day: "2-digit",
                  month: "long",
                })}
              </p>
            </div>
          </div>

          {/* Editor body */}
          <div ref={editorContainerRef} className="px-10 py-8 bg-paper relative">
            <EditorContent editor={editor} />
            {/* Botón + lateral en bloques vacíos */}
            {editor && blockHover && !slash.open && (
              <button
                type="button"
                onMouseDown={(e) => {
                  // Evitar que el editor pierda foco antes de procesar el click
                  e.preventDefault();
                }}
                onClick={() => {
                  const pos = blockHover.blockEndPos;
                  slash.openAt(pos, {
                    top: blockHover.viewportTop + 26,
                    left: blockHover.viewportLeft,
                  });
                  clearBlockHover();
                }}
                className="slash-add-btn"
                style={{
                  top: blockHover.top,
                  left: 8,
                }}
                title="Insertar bloque (/)"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Slash command menu */}
      {editor && (
        <SlashCommandMenu
          editor={editor}
          open={slash.open}
          query={slash.query}
          position={slash.position}
          charsToDelete={slash.charsToDelete}
          onClose={slash.close}
        />
      )}

      {/* Bubble menu — selección flotante */}
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "top" }}
          className="flex items-center gap-0.5 px-1.5 py-1 bg-ink text-paper shadow-ink rounded-md"
        >
          <BubbleBtn
            onClick={() => (editor.chain().focus() as never as { toggleBold: () => { run: () => void } }).toggleBold().run()}
            active={editor.isActive("bold")}
            label="Negrita"
          >
            <BoldIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
          </BubbleBtn>
          <BubbleBtn
            onClick={() => (editor.chain().focus() as never as { toggleItalic: () => { run: () => void } }).toggleItalic().run()}
            active={editor.isActive("italic")}
            label="Cursiva"
          >
            <ItalicIcon className="w-3.5 h-3.5" strokeWidth={2} />
          </BubbleBtn>
          <BubbleBtn
            onClick={() => (editor.chain().focus() as never as { toggleHighlight: () => { run: () => void } }).toggleHighlight().run()}
            active={editor.isActive("highlight")}
            label="Resaltar"
          >
            <Highlighter className="w-3.5 h-3.5" strokeWidth={2} />
          </BubbleBtn>
          <BubbleBtn
            onClick={() => (editor.chain().focus() as never as { toggleBlockquote: () => { run: () => void } }).toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            label="Cita"
          >
            <QuoteIcon className="w-3.5 h-3.5" strokeWidth={2} />
          </BubbleBtn>
          <span className="w-px h-4 bg-paper/20 mx-0.5" />
          <button
            onClick={() => {
              const text = editor.state.doc.textBetween(
                editor.state.selection.from,
                editor.state.selection.to,
                " ",
              );
              if (!text.trim()) {
                toast.error("Seleccioná texto primero");
                return;
              }
              setSelectedText(text);
              setFlashOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-orange text-paper hover:bg-orange-deep transition-colors rounded-sm"
            title="Crear flashcard de la selección"
          >
            <LayersIcon className="w-3 h-3" strokeWidth={2.5} />
            Flashcard
          </button>
        </BubbleMenu>
      )}

      <FlashcardFromSelection
        open={flashOpen}
        initialFront={selectedText}
        userId={userId}
        notebookId={note.notebook_id}
        documentId={note.document_id}
        onClose={() => setFlashOpen(false)}
        onCreated={() => toast.success("Flashcard agregada al cuaderno")}
      />
    </div>
  );
}

function BubbleBtn({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-sm transition-colors ${
        active ? "bg-orange text-paper" : "text-paper/80 hover:text-paper hover:bg-paper/10"
      }`}
    >
      {children}
    </button>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const colors: { key: string; class: string; label: string }[] = [
    { key: "cream", class: "bg-cream border-border", label: "Crema" },
    { key: "orange", class: "bg-orange/40 border-orange", label: "Naranja" },
    { key: "ink", class: "bg-ink/30 border-ink", label: "Tinta" },
  ];
  return (
    <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 border border-border rounded-md">
      {colors.map((c) => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          title={c.label}
          className={`w-4 h-4 border ${c.class} transition-all rounded-full ${
            value === c.key ? "ring-2 ring-ink ring-offset-1 ring-offset-paper" : "opacity-70 hover:opacity-100"
          }`}
        />
      ))}
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-orange-deep">
        <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2.5} />
        Guardando…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-ink/50">
        <CheckCheck className="w-3 h-3" strokeWidth={2.5} />
        Guardado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-ink/40">
      <FileText className="w-3 h-3" strokeWidth={2} />
      Sin cambios
    </span>
  );
}
