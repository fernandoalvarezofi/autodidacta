import { useState, useEffect } from "react";
import { Check, X, ChevronRight, RotateCw, Trophy, Sparkles, Award, Users, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { awardXp, XP } from "@/lib/gamification";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { createRoom } from "@/lib/quiz-room";
import { toast } from "sonner";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface QuizRunnerProps {
  questions: QuizQuestion[];
  documentId?: string;
  documentTitle?: string;
}

export function QuizRunner({ questions, documentId, documentTitle }: QuizRunnerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creatingRoom, setCreatingRoom] = useState(false);

  const handleCreateRoom = async () => {
    if (!user || !documentId || questions.length === 0) return;
    setCreatingRoom(true);
    try {
      const { data: out } = await supabase
        .from("document_outputs")
        .select("id, document_id")
        .eq("document_id", documentId)
        .eq("type", "quiz")
        .maybeSingle();
      const { data: doc } = await supabase
        .from("documents")
        .select("notebook_id")
        .eq("id", documentId)
        .maybeSingle();

      if (!out) {
        toast.error("No se encontró el quiz");
        return;
      }

      const room = await createRoom({
        hostUserId: user.id,
        quizOutputId: out.id,
        documentId,
        notebookId: doc?.notebook_id ?? null,
        quizTitle: documentTitle ?? "Quiz",
        questions,
      });
      toast.success(`Sala creada: ${room.code}`);
      navigate({ to: "/play/$roomId", params: { roomId: room.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo crear la sala");
    } finally {
      setCreatingRoom(false);
    }
  };
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Reset transition flag
  useEffect(() => {
    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), 50);
    return () => clearTimeout(t);
  }, [index]);

  if (questions.length === 0) {
    return <p className="text-ink/50 text-sm">No hay quiz disponible.</p>;
  }

  if (finished) {
    const correct = answers.filter((a, i) => a === questions[i].correct_index).length;
    const pct = Math.round((correct / questions.length) * 100);
    const grade =
      pct >= 90
        ? { label: "Dominio total", color: "text-orange-deep", emoji: "🏆" }
        : pct >= 70
          ? { label: "Muy bien", color: "text-orange", emoji: "✨" }
          : pct >= 50
            ? { label: "Aprobado", color: "text-ink", emoji: "📘" }
            : { label: "A repasar", color: "text-ink/60", emoji: "📖" };

    return (
      <div className="max-w-2xl mx-auto animate-scale-in">
        <div className="relative border-2 border-ink bg-paper p-10 md:p-14 text-center overflow-hidden shadow-elevated">
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-orange" />

          {/* Trophy with glow */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 mx-auto">
            <div className="absolute inset-0 bg-gradient-orange rounded-full blur-2xl opacity-40 animate-pulse-glow" />
            <div className="relative w-20 h-20 inline-flex items-center justify-center bg-gradient-orange rounded-full shadow-orange animate-confetti">
              <Trophy className="w-9 h-9 text-paper" strokeWidth={1.75} />
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.35em] text-orange font-mono mb-4">
            Quiz completo
          </p>

          {/* Big score */}
          <div className="flex items-baseline justify-center gap-3 mb-2">
            <h3 className="font-display text-7xl md:text-8xl font-semibold tracking-tight leading-none">
              {correct}
            </h3>
            <span className="font-display text-3xl text-ink/40">/ {questions.length}</span>
          </div>

          <p className={`font-display text-xl mb-1 ${grade.color}`}>
            {grade.emoji} {grade.label}
          </p>
          <p className="text-sm text-ink/60 font-mono mb-8">{pct}% de aciertos</p>

          {/* Mini timeline of answers */}
          <div className="flex items-center justify-center gap-1 mb-8 flex-wrap max-w-md mx-auto">
            {answers.map((a, i) => {
              const ok = a === questions[i].correct_index;
              return (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${ok ? "bg-orange" : "bg-destructive/60"}`}
                  title={`Pregunta ${i + 1}: ${ok ? "correcta" : "incorrecta"}`}
                />
              );
            })}
          </div>

          <button
            onClick={() => {
              setIndex(0);
              setSelected(null);
              setAnswers([]);
              setFinished(false);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95"
          >
            <RotateCw className="w-4 h-4" strokeWidth={2} />
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const answered = selected !== null;
  const isCorrect = selected === q.correct_index;
  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (selected === q.correct_index) {
      void awardXp(XP.quizCorrect);
    }
    if (index + 1 >= questions.length) {
      void awardXp(XP.quizComplete);
      setFinished(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs uppercase tracking-[0.25em] font-mono text-ink/50">
          Pregunta <span className="text-ink font-medium">{index + 1}</span>
          <span className="text-ink/30"> / {questions.length}</span>
        </p>
        <p className="text-xs uppercase tracking-[0.2em] font-mono text-orange flex items-center gap-1.5">
          <Award className="w-3 h-3" strokeWidth={2.5} />
          Evaluación
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-orange transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        key={index}
        className={`border-2 border-ink p-8 md:p-10 mb-6 bg-paper shadow-elevated transition-opacity ${
          transitioning ? "opacity-0" : "opacity-100 animate-fade-up"
        }`}
      >
        <h3 className="font-display text-xl md:text-2xl text-ink leading-snug mb-8">
          {q.question}
        </h3>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const isSel = selected === i;
            const isRight = i === q.correct_index;
            let cls = "border-border hover:border-ink hover:bg-cream/40 hover:translate-x-1";
            let extraAnim = "";
            if (answered) {
              if (isRight) {
                cls = "border-orange bg-orange/10 text-ink";
                extraAnim = "animate-correct-pop";
              } else if (isSel) {
                cls = "border-destructive bg-destructive/10 text-ink";
                extraAnim = "animate-shake";
              } else {
                cls = "border-border opacity-40";
              }
            } else if (isSel) {
              cls = "border-ink bg-ink/5 translate-x-1";
            }
            const letter = String.fromCharCode(65 + i); // A, B, C, D
            return (
              <button
                key={i}
                onClick={() => !answered && setSelected(i)}
                disabled={answered}
                className={`w-full text-left px-5 py-4 border-2 transition-all duration-200 flex items-center gap-4 ${cls} ${extraAnim}`}
              >
                <span
                  className={`flex-shrink-0 w-8 h-8 inline-flex items-center justify-center text-xs font-mono font-medium border transition-colors ${
                    answered && isRight
                      ? "bg-orange text-paper border-orange"
                      : answered && isSel && !isRight
                        ? "bg-destructive text-paper border-destructive"
                        : isSel
                          ? "bg-ink text-paper border-ink"
                          : "border-border text-ink/60"
                  }`}
                >
                  {letter}
                </span>
                <span className="text-base flex-1">{opt}</span>
                {answered && isRight && (
                  <Check className="w-5 h-5 text-orange flex-shrink-0" strokeWidth={2.5} />
                )}
                {answered && isSel && !isRight && (
                  <X className="w-5 h-5 text-destructive flex-shrink-0" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-6 p-5 border-l-2 animate-fade-up ${
              isCorrect ? "border-orange bg-orange/5" : "border-destructive bg-destructive/5"
            }`}
          >
            <p
              className={`text-xs uppercase tracking-[0.25em] font-mono mb-2 inline-flex items-center gap-1.5 ${
                isCorrect ? "text-orange-deep" : "text-destructive"
              }`}
            >
              {isCorrect ? (
                <>
                  <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                  Correcto · +{XP.quizCorrect} XP
                </>
              ) : (
                <>
                  <X className="w-3 h-3" strokeWidth={2.5} />
                  Incorrecto
                </>
              )}
            </p>
            <p className="text-sm text-ink/80 leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {/* Mini progress dots */}
        <div className="flex items-center gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-orange"
                  : i < index
                    ? answers[i] === questions[i].correct_index
                      ? "w-1.5 bg-orange/60"
                      : "w-1.5 bg-destructive/40"
                    : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!answered}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95"
        >
          {index + 1 >= questions.length ? "Ver resultado" : "Siguiente"}
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
