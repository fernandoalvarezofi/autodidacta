import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { NeuralBackground } from "@/components/NeuralBackground";
import { supabase } from "@/integrations/supabase/client";
import {
  AREA_META,
  calcularAreaScores,
  calcularIQ,
  calcularPercentil,
  esPreguntaVisual,
  type Area,
  type Dificultad,
} from "@/lib/iq-scoring";

export const Route = createFileRoute("/iq/test/$intentoId")({
  head: () => ({
    meta: [
      { title: "Test de IQ — En curso" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IQTestRunner,
});

interface Question {
  id: string;
  area: Area;
  dificultad: Dificultad;
  pregunta: string;
  opciones: string[];
  indice_correcto: number;
  es_espacial: boolean;
}

const TOTAL_SECONDS = 20 * 60;

function IQTestRunner() {
  const { intentoId } = useParams({ from: "/iq/test/$intentoId" });
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingState, setLoadingState] = useState<"loading" | "ready" | "error">("loading");
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<
    Array<{ question_id: string; indice_seleccionado: number; es_correcto: boolean; tiempo_ms: number }>
  >([]);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const questionStartedAt = useRef<number>(Date.now());

  // Cargar preguntas según orden guardado
  useEffect(() => {
    (async () => {
      try {
        const raw = sessionStorage.getItem("iq_session_questions");
        if (!raw) {
          setLoadingState("error");
          return;
        }
        const parsed = JSON.parse(raw) as { attemptId: string; questionIds: string[] };
        if (parsed.attemptId !== intentoId || !Array.isArray(parsed.questionIds)) {
          setLoadingState("error");
          return;
        }
        const { data, error } = await supabase
          .from("iq_questions")
          .select("id, area, dificultad, pregunta, opciones, indice_correcto, es_espacial")
          .in("id", parsed.questionIds);
        if (error || !data) {
          setLoadingState("error");
          return;
        }
        const byId = new Map(data.map((q) => [q.id, q]));
        const ordered: Question[] = [];
        for (const id of parsed.questionIds) {
          const q = byId.get(id);
          if (q) {
            ordered.push({
              id: q.id,
              area: q.area as Area,
              dificultad: q.dificultad as Dificultad,
              pregunta: q.pregunta,
              opciones: q.opciones as string[],
              indice_correcto: q.indice_correcto,
              es_espacial: !!q.es_espacial,
            });
          }
        }
        setQuestions(ordered);
        setLoadingState("ready");
        questionStartedAt.current = Date.now();
      } catch {
        setLoadingState("error");
      }
    })();
  }, [intentoId]);

  // Timer global
  useEffect(() => {
    if (loadingState !== "ready") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          finalize(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState]);

  const current = questions[idx];
  const total = questions.length || 60;
  const isLast = idx === total - 1;

  const goNext = async () => {
    if (selected === null || !current) return;
    const tiempo_ms = Date.now() - questionStartedAt.current;
    const es_correcto = selected === current.indice_correcto;
    const newAnswer = {
      question_id: current.id,
      indice_seleccionado: selected,
      es_correcto,
      tiempo_ms,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    // Persistir respuesta (no bloqueante para UX, pero lo esperamos para asegurar consistencia)
    supabase
      .from("iq_answers")
      .insert({ attempt_id: intentoId, ...newAnswer })
      .then(({ error }) => {
        if (error) console.error("[iq_answers]", error.message);
      });

    if (isLast) {
      await finalize(false, newAnswers);
      return;
    }
    setIdx(idx + 1);
    setSelected(null);
    questionStartedAt.current = Date.now();
  };

  const finalize = async (
    timedOut: boolean,
    finalAnswers = answers,
  ) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const lite = questions.map((q) => ({ id: q.id, area: q.area, dificultad: q.dificultad }));
      const iq = calcularIQ(finalAnswers, lite);
      const percentil = calcularPercentil(iq);
      const areaScores = calcularAreaScores(finalAnswers, lite);
      const correctas = finalAnswers.filter((a) => a.es_correcto).length;
      await supabase
        .from("iq_attempts")
        .update({
          completed_at: new Date().toISOString(),
          respuestas_correctas: correctas,
          iq_score: iq,
          percentil,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          area_scores: areaScores as any,
        })
        .eq("id", intentoId);
      navigate({ to: "/iq/resultado/$intentoId", params: { intentoId }, replace: true });
    } catch (e) {
      console.error(e);
      setSubmitting(false);
      if (timedOut) {
        // intento de cierre forzado
        navigate({ to: "/iq/resultado/$intentoId", params: { intentoId }, replace: true });
      }
    }
  };

  const timerText = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [secondsLeft]);
  const timerCritical = secondsLeft < 5 * 60;

  if (loadingState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/50" />
      </div>
    );
  }
  if (loadingState === "error" || !current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-ink p-8 text-center">
        <h2 className="font-display text-2xl">No pudimos cargar el test</h2>
        <p className="text-ink/60 mt-2 text-sm">
          Volvé al formulario inicial para reintentar.
        </p>
        <button
          onClick={() => navigate({ to: "/iq/inicio" })}
          className="mt-6 px-4 py-2 bg-ink text-paper rounded-md text-sm"
        >
          Volver
        </button>
      </div>
    );
  }

  const meta = AREA_META[current.area];
  const visual = esPreguntaVisual(current.es_espacial, current.pregunta);
  const progress = ((idx + (selected !== null ? 0.5 : 0)) / total) * 100;

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <NeuralBackground />

      <header className="sticky top-0 z-30 bg-paper/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-5 lg:px-8 max-w-[820px] h-14 flex items-center justify-between gap-4">
          <span className="text-[13px] text-ink/70 font-mono">
            Pregunta {idx + 1} <span className="text-ink/40">/ {total}</span>
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider border rounded ${meta.chipClass}`}
          >
            {meta.label}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[13px] font-mono ${
              timerCritical ? "text-destructive font-semibold" : "text-ink/60"
            }`}
          >
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            {timerText}
          </span>
        </div>
        <div className="h-1 bg-cream/60">
          <div
            className="h-full bg-gradient-to-r from-orange to-orange-deep transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="container mx-auto px-5 lg:px-8 max-w-[820px] py-10">
        {visual ? (
          <div className="rounded-xl border border-border bg-gradient-to-br from-cream to-paper py-12 px-6 text-center shadow-soft">
            <p className="font-mono text-4xl tracking-wide leading-snug text-ink whitespace-pre-wrap">
              {current.pregunta}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-paper/90 backdrop-blur-sm p-6 shadow-soft">
            <p className="font-display text-lg lg:text-xl leading-relaxed text-ink">
              {current.pregunta}
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-3">
          {current.opciones.map((opt, i) => {
            const isSel = selected === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`group flex items-start gap-4 text-left p-4 rounded-lg border transition-all ${
                  isSel
                    ? "border-orange bg-orange/5 shadow-orange"
                    : "border-border bg-paper hover:border-ink/40 hover:bg-cream/40"
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-md font-mono text-[13px] flex-shrink-0 ${
                    isSel
                      ? "bg-orange text-paper"
                      : "bg-cream text-ink/70 group-hover:bg-cream/80"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-[15px] leading-snug text-ink">{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-[12px] font-mono text-ink/40 uppercase tracking-wider">
            {current.dificultad}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={selected === null || submitting}
            className="inline-flex items-center gap-2 h-11 px-5 bg-ink text-paper text-[14px] font-medium rounded-md hover:bg-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLast ? "Ver resultado" : "Siguiente"}
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
