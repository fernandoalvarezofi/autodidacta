import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, BookOpen, Layers, RotateCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
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

interface SummaryContent {
  markdown: string;
}

interface FlashcardOutput {
  front: string;
  back: string;
}

function DocumentPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [doc, setDoc] = useState<DocumentRow | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"summary" | "flashcards">("summary");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

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
        if (sum) setSummary((sum.content as unknown as SummaryContent).markdown);
        if (flash) setFlashcards(flash.content as unknown as FlashcardOutput[]);
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

        <div className="flex gap-1 mb-8 border-b border-border">
          <TabButton active={tab === "summary"} onClick={() => setTab("summary")} icon={<BookOpen className="w-4 h-4" strokeWidth={1.75} />}>
            Resumen
          </TabButton>
          <TabButton
            active={tab === "flashcards"}
            onClick={() => {
              setTab("flashcards");
              setCardIndex(0);
              setFlipped(false);
            }}
            icon={<Layers className="w-4 h-4" strokeWidth={1.75} />}
          >
            Flashcards ({flashcards.length})
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

        {tab === "flashcards" && (
          <FlashcardDeck
            cards={flashcards}
            index={cardIndex}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
            onNext={() => {
              setFlipped(false);
              setCardIndex((i) => (i + 1) % flashcards.length);
            }}
          />
        )}
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
      className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition-colors -mb-px border-b-2 ${
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

function SummaryRender({ markdown }: { markdown: string }) {
  // Lightweight markdown renderer (h2, h3, bold, blockquote, lists, paragraphs)
  const lines = markdown.split("\n");
  const out: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="list-disc list-outside pl-6 my-4 space-y-2 text-ink/85">
          {listBuffer.map((it, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushList();
      out.push(
        <h2 key={i} className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-ink mt-10 mb-4 pb-2 border-b border-border">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      flushList();
      out.push(
        <h3 key={i} className="font-display text-xl font-semibold text-ink mt-8 mb-3">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("> ")) {
      flushList();
      out.push(
        <blockquote
          key={i}
          className="border-l-2 border-orange pl-5 italic text-ink/70 my-5 font-display text-lg"
          dangerouslySetInnerHTML={{ __html: inline(line.slice(2)) }}
        />,
      );
    } else if (/^[-*] /.test(line)) {
      listBuffer.push(line.slice(2));
    } else if (line === "") {
      flushList();
    } else {
      flushList();
      out.push(
        <p
          key={i}
          className="text-base leading-7 text-ink/85 my-4"
          dangerouslySetInnerHTML={{ __html: inline(line) }}
        />,
      );
    }
  });
  flushList();
  return <>{out}</>;
}

function inline(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function FlashcardDeck({
  cards,
  index,
  flipped,
  onFlip,
  onNext,
}: {
  cards: FlashcardOutput[];
  index: number;
  flipped: boolean;
  onFlip: () => void;
  onNext: () => void;
}) {
  if (cards.length === 0) {
    return <p className="text-ink/50 text-sm">No hay flashcards disponibles.</p>;
  }
  const card = cards[index];

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-wider font-mono text-ink/50 text-center mb-4">
        Tarjeta {index + 1} de {cards.length}
      </p>
      <button
        onClick={onFlip}
        className="block w-full bg-cream/40 border-2 border-ink p-10 md:p-14 min-h-[280px] text-left hover:bg-cream/60 transition-colors"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-4">
          {flipped ? "Respuesta" : "Pregunta"}
        </p>
        <p className="font-display text-2xl md:text-3xl text-ink leading-snug">
          {flipped ? card.back : card.front}
        </p>
        <p className="text-xs text-ink/40 mt-8 font-mono uppercase tracking-wider">
          Click para {flipped ? "ver pregunta" : "revelar"}
        </p>
      </button>
      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-ink text-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <RotateCw className="w-4 h-4" strokeWidth={1.75} />
          Siguiente
        </button>
      </div>
    </div>
  );
}
