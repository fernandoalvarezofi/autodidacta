import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Layers,
  HelpCircle,
  MessagesSquare,
  Network,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SummaryRender, type SummaryContent } from "@/components/document/SummaryRender";
import { FlashcardDeck, type FlashcardOutput } from "@/components/document/FlashcardDeck";
import { QuizRunner, type QuizQuestion } from "@/components/document/QuizRunner";
import { DocumentChat } from "@/components/document/DocumentChat";
import { MindMapViewer, type MindmapContent } from "@/components/document/MindMapViewer";
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

type Tab = "summary" | "mindmap" | "flashcards" | "quiz" | "chat";

function DocumentPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [doc, setDoc] = useState<DocumentRow | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardOutput[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [mindmap, setMindmap] = useState<MindmapContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("summary");

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

  return (
    <DashboardShell>
      <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-10 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] -z-10 opacity-30 bg-radial-orange pointer-events-none" />

        <Link
          to="/notebook/$id"
          params={{ id: doc.notebook_id }}
          className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.75} />
          Volver al cuaderno
        </Link>

        <div className="pb-8 mb-10 border-b-2 border-ink animate-fade-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-orange font-mono">
              <span className="w-1 h-1 bg-orange rounded-full animate-pulse" />
              Documento
            </span>
            <span className="text-xs font-mono text-ink/40">·</span>
            <span className="text-xs font-mono uppercase tracking-wider text-ink/50">
              Listo para estudiar
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            {doc.title}
          </h1>
        </div>

        <div className="flex gap-1 mb-10 border-b border-border overflow-x-auto sticky top-16 bg-paper/85 backdrop-blur-xl z-30 -mx-6 px-6 lg:-mx-10 lg:px-10">
          <TabButton
            active={tab === "summary"}
            onClick={() => setTab("summary")}
            icon={<BookOpen className="w-4 h-4" strokeWidth={1.75} />}
          >
            Resumen
          </TabButton>
          <TabButton
            active={tab === "mindmap"}
            onClick={() => setTab("mindmap")}
            icon={<Network className="w-4 h-4" strokeWidth={1.75} />}
            count={mindmap?.nodes.length}
          >
            Mapa
          </TabButton>
          <TabButton
            active={tab === "flashcards"}
            onClick={() => setTab("flashcards")}
            icon={<Layers className="w-4 h-4" strokeWidth={1.75} />}
            count={flashcards.length}
          >
            Flashcards
          </TabButton>
          <TabButton
            active={tab === "quiz"}
            onClick={() => setTab("quiz")}
            icon={<HelpCircle className="w-4 h-4" strokeWidth={1.75} />}
            count={quiz.length}
          >
            Quiz
          </TabButton>
          <TabButton
            active={tab === "chat"}
            onClick={() => setTab("chat")}
            icon={<MessagesSquare className="w-4 h-4" strokeWidth={1.75} />}
            highlight
          >
            Chat
          </TabButton>
        </div>

        <div className="animate-fade-in" key={tab}>
          {tab === "summary" && (
            <article className="prose-academic">
              {summary ? (
                <SummaryRender markdown={summary} />
              ) : (
                <p className="text-ink/50 text-sm">No hay resumen disponible.</p>
              )}
            </article>
          )}

          {tab === "mindmap" && (
            mindmap ? (
              <MindMapViewer content={mindmap} />
            ) : (
              <div className="border-2 border-dashed border-border bg-paper p-12 text-center">
                <p className="text-ink/50 text-sm">El mapa mental aún no está disponible para este documento.</p>
                <p className="text-xs text-ink/40 mt-2 font-mono uppercase tracking-wider">Reprocesá el documento para generarlo</p>
              </div>
            )
          )}

          {tab === "flashcards" && <FlashcardDeck cards={flashcards} />}

          {tab === "quiz" && <QuizRunner questions={quiz} />}

          {tab === "chat" && <DocumentChat documentId={doc.id} />}
        </div>
      </div>
    </DashboardShell>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon,
  count,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
  count?: number;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition-all -mb-px border-b-2 whitespace-nowrap relative ${
        active
          ? "border-orange text-ink font-medium"
          : "border-transparent text-ink/60 hover:text-ink hover:bg-cream/40"
      }`}
    >
      <span className={active ? "text-orange" : ""}>{icon}</span>
      {children}
      {count !== undefined && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
            active ? "bg-orange/15 text-orange-deep" : "bg-cream text-ink/50"
          }`}
        >
          {count}
        </span>
      )}
      {highlight && !active && (
        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange rounded-full animate-pulse" />
      )}
    </button>
  );
}
