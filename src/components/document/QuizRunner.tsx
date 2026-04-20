import { useState } from "react";
import { Check, X, ChevronRight, RotateCw, Trophy } from "lucide-react";
import { awardXp, XP } from "@/lib/gamification";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export function QuizRunner({ questions }: { questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) {
    return <p className="text-ink/50 text-sm">No hay quiz disponible.</p>;
  }

  if (finished) {
    const correct = answers.filter((a, i) => a === questions[i].correct_index).length;
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center py-12 border-2 border-ink bg-cream/30 px-6">
        <Trophy className="w-10 h-10 mx-auto mb-4 text-orange" strokeWidth={1.5} />
        <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-3">Quiz completo</p>
        <h3 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2">
          {correct} de {questions.length}
        </h3>
        <p className="text-ink/70 mb-8">{pct}% de aciertos</p>
        <button
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setAnswers([]);
            setFinished(false);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <RotateCw className="w-4 h-4" strokeWidth={1.75} />
          Volver a intentar
        </button>
      </div>
    );
  }

  const q = questions[index];
  const answered = selected !== null;
  const isCorrect = selected === q.correct_index;

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-wider font-mono text-ink/50 mb-4">
        Pregunta {index + 1} de {questions.length}
      </p>

      <div className="border-2 border-ink p-8 md:p-10 mb-6 bg-cream/30">
        <h3 className="font-display text-xl md:text-2xl text-ink leading-snug mb-8">
          {q.question}
        </h3>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isSel = selected === i;
            const isRight = i === q.correct_index;
            let cls = "border-border hover:border-ink hover:bg-cream/50";
            if (answered) {
              if (isRight) cls = "border-orange bg-orange/10 text-ink";
              else if (isSel) cls = "border-destructive bg-destructive/10 text-ink";
              else cls = "border-border opacity-50";
            } else if (isSel) {
              cls = "border-ink bg-ink/5";
            }
            return (
              <button
                key={i}
                onClick={() => !answered && setSelected(i)}
                disabled={answered}
                className={`w-full text-left px-5 py-4 border-2 transition-colors flex items-center justify-between gap-3 ${cls}`}
              >
                <span className="text-base">{opt}</span>
                {answered && isRight && (
                  <Check className="w-5 h-5 text-orange flex-shrink-0" strokeWidth={2} />
                )}
                {answered && isSel && !isRight && (
                  <X className="w-5 h-5 text-destructive flex-shrink-0" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-6 p-4 border-l-2 ${
              isCorrect ? "border-orange bg-orange/5" : "border-destructive bg-destructive/5"
            }`}
          >
            <p className="text-xs uppercase tracking-wider font-mono mb-2 text-ink/60">
              {isCorrect ? "Correcto" : "Incorrecto"}
            </p>
            <p className="text-sm text-ink/80 leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!answered}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {index + 1 >= questions.length ? "Ver resultado" : "Siguiente"}
          <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
