import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  BookOpen,
  Layers,
  HelpCircle,
  MessagesSquare,
  Network,
  PenLine,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { SummaryRender, type SummaryContent } from "@/components/document/SummaryRender";
import { FlashcardDeck, type FlashcardOutput } from "@/components/document/FlashcardDeck";
import { QuizRunner, type QuizQuestion } from "@/components/document/QuizRunner";
import { DocumentChat } from "@/components/document/DocumentChat";
import { MindMapViewer, type MindmapContent } from "@/components/document/MindMapViewer";
import {
  GeneratedDocPanel,
  type GeneratedDocType,
  type GeneratedContent,
} from "@/components/document/GeneratedDocPanel";
import { ExportButton } from "@/components/ui/ExportButton";
import { createNote } from "@/lib/notes";
import { getTemplate } from "@/lib/note-templates";
import { toast } from "sonner";

export const Route = createFileRoute("/document/$id")({
  component: DocumentPage,
});

interface DocumentRow {
  id: string;
  title: string;
  notebook_id: string;
  status: string;
}

type Tab = "chat" | "summary" | "mindmap" | "flashcards" | "quiz" | "generate";

function DocumentPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [doc, setDoc] = useState<DocumentRow | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardOutput[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [mindmap, setMindmap] = useState<MindmapContent | null>(null);
  const [generated, setGenerated] = useState<
    Partial<Record<GeneratedDocType, GeneratedContent>>
  >({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("chat");
  const [creatingNote, setCreatingNote] = useState(false);

  const handleEditAsNote = async () => {
    if (!user || !doc) return;
    setCreatingNote(true);
    try {
      const tpl = getTemplate("academic");
      const built = tpl.build({ title: doc.title, sourceMarkdown: summary ?? "" });
      const html = summary
        ? `<h1>${escapeHtml(doc.title)}</h1>${markdownToHtml(summary)}`
        : built.html;
      const note = await createNote({
        userId: user.id,
        notebookId: doc.notebook_id,
        documentId: doc.id,
        title: doc.title,
        contentHtml: html,
        contentJson: {},
        templateKey: summary ? "academic" : tpl.key,
        emoji: "pencil",
        coverColor: "cream",
      });
      toast.success("Nota creada desde el resumen");
      navigate({ to: "/editor/$id", params: { id: note.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear nota");
    } finally {
      setCreatingNote(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: docData, error: docErr } = await supabase
        .from("documents")
        .select("id, title, notebook_id, status")
        .eq("id", id)
        .maybeSingle();
      if (docErr || !docData) {
        toast.error("Documento no encontrado");
        navigate({ to: "/dashboard" });
        return;
      }
      setDoc(docData as DocumentRow);

      const { data: outputs } = await supabase
        .from("document_outputs")
        .select("type, content")
        .eq("document_id", id);

      if (outputs) {
        const sum = outputs.find((o) => o.type === "summary");
        const flash = outputs.find((o) => o.type === "flashcards");
        const qz = outputs.find((o) => o.type === "quiz");
        const mm = outputs.find((o) => o.type === "mindmap");
        if (sum) setSummary((sum.content as unknown as SummaryContent).markdown);
        if (flash) setFlashcards(flash.content as unknown as FlashcardOutput[]);
        if (qz) setQuiz(qz.content as unknown as QuizQuestion[]);
        if (mm) setMindmap(mm.content as unknown as MindmapContent);

        const genMap: Partial<Record<GeneratedDocType, GeneratedContent>> = {};
        for (const o of outputs) {
          if (
            o.type === "study_guide" ||
            o.type === "timeline" ||
            o.type === "faq" ||
            o.type === "business_plan"
          ) {
            genMap[o.type as GeneratedDocType] = o.content as unknown as GeneratedContent;
          }
        }
        setGenerated(genMap);
      }
      setLoading(false);
    })();
  }, [user, id, navigate]);

  if (authLoading || loading || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  // Tab activo: ¿necesita ancho amplio?
  const wide = tab === "mindmap" || tab === "flashcards" || tab === "quiz" || tab === "generate";
  const generatedCount = Object.keys(generated).length;

  return (
    <DashboardShell>
      <WorkspaceLayout
        title={doc.title}
        eyebrow="Documento"
        backTo={{
          to: "/notebook/$id",
          params: { id: doc.notebook_id },
          label: "Volver al cuaderno",
        }}
        groups={[
          {
            items: [
              {
                key: "chat",
                label: "Chat",
                icon: <MessagesSquare className="w-4 h-4" strokeWidth={1.75} />,
                badge: "IA",
              },
            ],
          },
          {
            label: "Material de estudio",
            items: [
              {
                key: "summary",
                label: "Resumen",
                icon: <BookOpen className="w-4 h-4" strokeWidth={1.75} />,
              },
              {
                key: "mindmap",
                label: "Mapa mental",
                icon: <Network className="w-4 h-4" strokeWidth={1.75} />,
                count: mindmap?.nodes.length,
              },
              {
                key: "flashcards",
                label: "Flashcards",
                icon: <Layers className="w-4 h-4" strokeWidth={1.75} />,
                count: flashcards.length,
              },
              {
                key: "quiz",
                label: "Quiz",
                icon: <HelpCircle className="w-4 h-4" strokeWidth={1.75} />,
                count: quiz.length,
              },
            ],
          },
          {
            label: "Generador",
            items: [
              {
                key: "generate",
                label: "Documentos auto",
                icon: <Wand2 className="w-4 h-4" strokeWidth={1.75} />,
                count: generatedCount || undefined,
                badge: generatedCount === 0 ? "Nuevo" : undefined,
              },
            ],
          },
        ]}
        activeKey={tab}
        onItemSelect={(k) => setTab(k as Tab)}
        headerAction={
          <button
            onClick={handleEditAsNote}
            disabled={creatingNote}
            className="group w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium border border-ink/80 hover:bg-ink hover:text-paper transition-all active:scale-[0.98] rounded-md disabled:opacity-50"
          >
            {creatingNote ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <PenLine className="w-3.5 h-3.5 group-hover:rotate-[-6deg] transition-transform" strokeWidth={1.75} />
            )}
            Editar como nota
          </button>
        }
        wide={wide}
      >
        {tab === "chat" && <DocumentChat documentId={doc.id} />}

        {tab === "summary" && (
          <div className="py-8 overflow-y-auto h-full">
            {summary && (
              <div className="flex items-center justify-end mb-4 -mt-4">
                <ExportButton
                  variant="compact"
                  title={`Resumen — ${doc.title}`}
                  filename={`resumen-${doc.title}`}
                  content={{ kind: "markdown", markdown: summary }}
                />
              </div>
            )}
            <article className="prose-academic">
              {summary ? (
                <SummaryRender markdown={summary} />
              ) : (
                <p className="text-ink/50 text-sm">No hay resumen disponible.</p>
              )}
            </article>
          </div>
        )}

        {tab === "mindmap" && (
          <div className="p-6 h-full">
            {mindmap ? (
              <MindMapViewer content={mindmap} />
            ) : (
              <div className="border-2 border-dashed border-border bg-paper p-12 text-center rounded-lg">
                <p className="text-ink/50 text-sm">El mapa mental aún no está disponible para este documento.</p>
                <p className="text-xs text-ink/40 mt-2 font-mono uppercase tracking-wider">Reprocesá el documento para generarlo</p>
              </div>
            )}
          </div>
        )}

        {tab === "flashcards" && (
          <div className="p-6 h-full overflow-y-auto">
            <FlashcardDeck cards={flashcards} />
          </div>
        )}

        {tab === "quiz" && (
          <div className="p-6 h-full overflow-y-auto">
            <QuizRunner questions={quiz} documentId={doc.id} documentTitle={doc.title} />
          </div>
        )}

        {tab === "generate" && (
          <div className="px-6 h-full">
            <GeneratedDocPanel documentId={doc.id} initialOutputs={generated} />
          </div>
        )}
      </WorkspaceLayout>
    </DashboardShell>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

// Conversor markdown → HTML mínimo (headings, listas, énfasis, citas, párrafos)
function markdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList: "ul" | "ol" | null = null;
  const closeList = () => {
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }
  };
  const inline = (s: string) =>
    escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      closeList();
      const lvl = Math.min(h[1].length, 3);
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
      continue;
    }
    if (/^>\s+/.test(line)) {
      closeList();
      out.push(`<blockquote><p>${inline(line.replace(/^>\s+/, ""))}</p></blockquote>`);
      continue;
    }
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ul) {
      if (inList !== "ul") {
        closeList();
        out.push("<ul>");
        inList = "ul";
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    if (ol) {
      if (inList !== "ol") {
        closeList();
        out.push("<ol>");
        inList = "ol";
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}
