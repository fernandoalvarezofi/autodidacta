import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Clock, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AREA_META,
  buildIQQuestionOrder,
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
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<
    Array<{ question_id: string; indice_seleccionado: number; es_correcto: boolean; tiempo_ms: number }>
  >([]);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const questionStartedAt = useRef<number>(Date.now());

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("iq_questions")
          .select("id, area, dificultad, pregunta, opciones, indice_correcto, es_espacial")
          .eq("is_active", true);
        if (error) {
          setErrorMsg(`Banco de preguntas: ${error.message}`);
          setLoadingState("error");
          return;
        }
        if (!data || data.length === 0) {
          setErrorMsg("No hay preguntas disponibles en el banco.");
          setLoadingState("error");
          return;
        }

        const raw = sessionStorage.getItem("iq_session_questions");
        let storedIds: string[] = [];
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { attemptId?: string; questionIds?: string[] };
            if (parsed && parsed.attemptId === intentoId && Array.isArray(parsed.questionIds)) {
              storedIds = parsed.questionIds;
            }
          } catch {
            // ignore
          }
        }

        const fallbackOrder = buildIQQuestionOrder(
          data.map((q) => ({ id: q.id, area: q.area as Area, dificultad: q.dificultad as Dificultad })),
        );
        const questionIds = storedIds.length > 0 ? storedIds : fallbackOrder;

        const byId = new Map(data.map((q) => [q.id, q]));
        const ordered: Question[] = [];
        for (const id of questionIds) {
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

        if (ordered.length < 20) {
          setErrorMsg(`Solo se cargaron ${ordered.length} preguntas (mínimo 20).`);
          setLoadingState("error");
          return;
        }

        sessionStorage.setItem(
          "iq_session_questions",
          JSON.stringify({ attemptId: intentoId, questionIds: ordered.map((q) => q.id) }),
        );

        setQuestions(ordered);
        setLoadingState("ready");
        questionStartedAt.current = Date.now();
      } catch (e) {
        console.error("[iq/test] load error", e);
        setErrorMsg(e instanceof Error ? e.message : "Error inesperado.");
        setLoadingState("error");
      }
    })();
  }, [intentoId]);

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
    const newAnswer = { question_id: current.id, indice_seleccionado: selected, es_correcto, tiempo_ms };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    supabase
      .from("iq_answers")
      .insert({ attempt_id: intentoId, ...newAnswer })
      .then(({ error }) => { if (error) console.error("[iq_answers]", error.message); });

    if (isLast) {
      await finalize(false, newAnswers);
      return;
    }
    setIdx(idx + 1);
    setSelected(null);
    questionStartedAt.current = Date.now();
  };

  const finalize = async (timedOut: boolean, finalAnswers = answers) => {
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
      if (timedOut) navigate({ to: "/iq/resultado/$intentoId", params: { intentoId }, replace: true });
    }
  };

  const timerText = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [secondsLeft]);
  const timerCritical = secondsLeft < 5 * 60;

  if (loadingState === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper">
        <Loader2 className="w-8 h-8 animate-spin text-ink/40 mb-4" />
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink/50">Cargando banco de preguntas</p>
      </div>
    );
  }
  if (loadingState === "error" || !current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink p-8">
        <div className="max-w-md w-full border-2 border-ink p-8 shadow-[6px_6px_0_0_var(--ink)]">
          <div className="inline-flex items-center gap-2 text-destructive mb-3">
            <AlertTriangle className="w-5 h-5" strokeWidth={2.25} />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Error al cargar</span>
          </div>
          <h2 className="font-display text-3xl mb-2">No pudimos iniciar el test</h2>
          {errorMsg && <p className="text-[13px] text-ink/70 font-mono bg-cream/40 border border-border p-3 mt-3">{errorMsg}</p>}
          <button
            onClick={() => navigate({ to: "/iq/inicio" })}
            className="mt-6 w-full px-4 py-3 bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-orange transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const meta = AREA_META[current.area];
  const visual = esPreguntaVisual(current.es_espacial, current.pregunta);
  const progress = ((idx + (selected !== null ? 0.5 : 0)) / total) * 100;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header brutalista — sticky */}
      <header className="sticky top-0 z-30 bg-paper border-b-2 border-ink">
        <div className="container mx-auto px-5 lg:px-8 max-w-[820px] h-14 flex items-center justify-between gap-4">
          <span className="font-mono text-[12px] tabular-nums text-ink">
            <span className="text-ink/40">N°</span> {(idx + 1).toString().padStart(2, "0")}
            <span className="text-ink/40"> / {total}</span>
          </span>
          <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] border-2 ${meta.chipClass}`}>
            {meta.label}
          </span>
          <span className={`inline-flex items-center gap-2 font-mono text-[13px] tabular-nums ${timerCritical ? "text-destructive font-bold" : "text-ink"}`}>
            <Clock className="w-3.5 h-3.5" strokeWidth={2.25} />
            {timerText}
          </span>
        </div>
        <div className="h-[3px] bg-cream">
          <div className="h-full bg-ink transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="container mx-auto px-5 lg:px-8 max-w-[820px] py-10 lg:py-14">
        {current.pregunta.includes("<svg") ? (
          <div className="border-2 border-ink bg-cream p-8 space-y-5">
            <div
              className="flex justify-center overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto [&_text]:fill-ink"
              dangerouslySetInnerHTML={{ __html: current.pregunta.split("\n")[0] }}
            />
            <p className="font-display text-xl lg:text-2xl leading-snug text-ink text-center">
              {current.pregunta.split("\n").slice(1).join(" ").trim()}
            </p>
          </div>
        ) : visual ? (
          <div className="border-2 border-ink bg-cream py-14 px-6 text-center">
            <p className="font-mono text-4xl tracking-wide leading-snug text-ink whitespace-pre-wrap">
              {current.pregunta}
            </p>
          </div>
        ) : (
          <div className="border-l-4 border-ink pl-6 py-2">
            <p className="font-display text-2xl lg:text-3xl leading-[1.25] text-ink tracking-tight">
              {current.pregunta}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-3">
          {current.opciones.map((opt, i) => {
            const isSel = selected === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`group flex items-start gap-4 text-left p-4 border-2 transition-all ${
                  isSel
                    ? "border-ink bg-ink text-paper shadow-[4px_4px_0_0_var(--orange)]"
                    : "border-ink/15 bg-paper hover:border-ink"
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex items-center justify-center w-8 h-8 font-mono text-[13px] flex-shrink-0 border-2 ${
                    isSel ? "bg-orange text-paper border-orange" : "bg-paper text-ink border-ink/30 group-hover:border-ink"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={`text-[15px] leading-snug pt-1 ${isSel ? "text-paper" : "text-ink"}`}>{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between border-t-2 border-ink pt-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-ink/50">
            Dificultad · {current.dificultad}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={selected === null || submitting}
            className="group inline-flex items-center gap-3 h-12 px-6 bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-orange transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLast ? "Ver resultado" : "Siguiente"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
