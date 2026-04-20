import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Highlighter,
  Undo2,
  Redo2,
  ListChecks,
  Minus,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center w-8 h-8 transition-all rounded-sm ${
        active
          ? "bg-ink text-paper"
          : "text-ink/70 hover:bg-cream hover:text-ink"
      }`}
    >
      {children}
    </button>
  );

  const Sep = () => <span className="w-px h-5 bg-border mx-0.5" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-paper/95 backdrop-blur-xl border border-border rounded-md shadow-soft sticky top-16 z-30">
      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        title="Deshacer (⌘Z)"
      >
        <Undo2 className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        title="Rehacer (⌘⇧Z)"
      >
        <Redo2 className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Título 1"
      >
        <Heading1 className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Título 2"
      >
        <Heading2 className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Título 3"
      >
        <Heading3 className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Negrita (⌘B)"
      >
        <Bold className="w-4 h-4" strokeWidth={2} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Cursiva (⌘I)"
      >
        <Italic className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Subrayado (⌘U)"
      >
        <UnderlineIcon className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Tachado"
      >
        <Strikethrough className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
        title="Resaltar"
      >
        <Highlighter className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Lista con viñetas"
      >
        <List className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Lista numerada"
      >
        <ListOrdered className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        title="Checklist"
      >
        <ListChecks className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Cita"
      >
        <Quote className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Bloque de código"
      >
        <Code className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Separador"
      >
        <Minus className="w-4 h-4" strokeWidth={1.75} />
      </Btn>
    </div>
  );
}
