import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, BookOpen, Layers, HelpCircle, MessagesSquare } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SummaryRender, type SummaryContent } from "@/components/document/SummaryRender";
import { FlashcardDeck, type FlashcardOutput } from "@/components/document/FlashcardDeck";
import { QuizRunner, type QuizQuestion } from "@/components/document/QuizRunner";
import { DocumentChat } from "@/components/document/DocumentChat";
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

type Tab = "summary" | "flashcards" | "quiz" | "chat";

function DocumentPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [doc, setDoc] = useState<DocumentRow | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardOutput[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
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
        if (sum) setSummary((sum.content as unknown as SummaryContent).markdown);
        if (flash) setFlashcards(flash.content as unknown as FlashcardOutput[]);
        if (qz) setQuiz(qz.content as unknown as QuizQuestion[]);
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
      <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-10">
        <Link
          to="/notebook/$id"
          params={{ id: doc.notebook_id }}
          className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Volver al cuaderno
        </Link>

        <div className="pb-6 mb-8 border-b-2 border-ink">
          <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-3">Documento</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{doc.title}</h1>
        </div>

        <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto">
          <TabButton
            active={tab === "summary"}
            onClick={() => setTab("summary")}
            icon={<BookOpen className="w-4 h-4" strokeWidth={1.75} />}
          >
            Resumen
          </TabButton>
          <TabButton
            active={tab === "flashcards"}
            onClick={() => setTab("flashcards")}
            icon={<Layers className="w-4 h-4" strokeWidth={1.75} />}
          >
            Flashcards ({flashcards.length})
          </TabButton>
          <TabButton
            active={tab === "quiz"}
            onClick={() => setTab("quiz")}
            icon={<HelpCircle className="w-4 h-4" strokeWidth={1.75} />}
          >
            Quiz ({quiz.length})
          </TabButton>
          <TabButton
            active={tab === "chat"}
            onClick={() => setTab("chat")}
            icon={<MessagesSquare className="w-4 h-4" strokeWidth={1.75} />}
          >
            Chat
          </TabButton>
        </div>

        {tab === "summary" && (
          <article className="prose-academic">
            {summary ? (
              <SummaryRender markdown={summary} />
            ) : (
              <p className="text-ink/50 text-sm">No hay resumen disponible.</p>
            )}
          </article>
        )}

        {tab === "flashcards" && <FlashcardDeck cards={flashcards} />}

        {tab === "quiz" && <QuizRunner questions={quiz} />}

        {tab === "chat" && <DocumentChat documentId={doc.id} />}
      </div>
    </DashboardShell>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition-colors -mb-px border-b-2 whitespace-nowrap ${
        active
          ? "border-orange text-ink font-medium"
          : "border-transparent text-ink/60 hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
