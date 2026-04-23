/**
 * Motor de scoring del Test de IQ.
 *
 * El test tiene 60 preguntas (15 por área × 4 áreas), con 5 fáciles, 5 medias
 * y 5 difíciles por área. Cada nivel pondera distinto.
 *
 *  - facil   → 1 punto
 *  - medio   → 2 puntos
 *  - dificil → 3 puntos
 *
 * Puntaje crudo máximo: 4 áreas × (5·1 + 5·2 + 5·3) = 4 × 30 = 120
 *
 * Convertimos puntaje crudo a IQ en escala estándar (media 100, σ 15)
 * usando una transformación lineal acotada al rango 55–160.
 */

export type Area = "logica" | "numerico" | "espacial" | "verbal";
export type Dificultad = "facil" | "medio" | "dificil";

export interface QuestionLite {
  id: string;
  area: Area;
  dificultad: Dificultad;
}

export interface AnswerLite {
  question_id: string;
  es_correcto: boolean;
}

const PESO: Record<Dificultad, number> = { facil: 1, medio: 2, dificil: 3 };
const MAX_RAW = 120;

/**
 * Convierte el puntaje crudo (0–120) a un IQ entre 55 y 160.
 * 50% del puntaje máximo se mapea a IQ 100 (media poblacional).
 */
export function calcularIQ(answers: AnswerLite[], questions: QuestionLite[]): number {
  const byId = new Map(questions.map((q) => [q.id, q]));
  let raw = 0;
  for (const a of answers) {
    if (!a.es_correcto) continue;
    const q = byId.get(a.question_id);
    if (!q) continue;
    raw += PESO[q.dificultad];
  }
  // ratio en [0,1]
  const ratio = Math.min(1, Math.max(0, raw / MAX_RAW));
  // mapeo: ratio 0.5 → 100, 0 → 55, 1 → 160 (lineal por tramos centrado)
  let iq: number;
  if (ratio <= 0.5) {
    iq = 55 + (100 - 55) * (ratio / 0.5);
  } else {
    iq = 100 + (160 - 100) * ((ratio - 0.5) / 0.5);
  }
  return Math.round(iq);
}

/**
 * Aproximación al percentil de una distribución normal (μ=100, σ=15).
 * Devuelve un número 0–100 con 2 decimales.
 */
export function calcularPercentil(iq: number): number {
  const z = (iq - 100) / 15;
  // CDF normal estándar — aproximación de Abramowitz & Stegun
  const cdf = (x: number) => {
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x) / Math.SQRT2;
    const t = 1 / (1 + 0.3275911 * ax);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
    return 0.5 * (1 + sign * erf);
  };
  const p = cdf(z) * 100;
  return Math.round(p * 100) / 100;
}

export type Clasificacion =
  | "Muy bajo"
  | "Bajo"
  | "Promedio bajo"
  | "Promedio"
  | "Promedio alto"
  | "Superior"
  | "Muy superior"
  | "Genio";

export function clasificarIQ(iq: number): { label: Clasificacion; color: string } {
  if (iq < 70) return { label: "Muy bajo", color: "var(--ink)" };
  if (iq < 85) return { label: "Bajo", color: "var(--ink)" };
  if (iq < 95) return { label: "Promedio bajo", color: "var(--ink)" };
  if (iq < 105) return { label: "Promedio", color: "var(--ink)" };
  if (iq < 115) return { label: "Promedio alto", color: "var(--orange)" };
  if (iq < 130) return { label: "Superior", color: "var(--orange)" };
  if (iq < 145) return { label: "Muy superior", color: "var(--orange-deep)" };
  return { label: "Genio", color: "var(--orange-deep)" };
}

export interface AreaScore {
  correctas: number;
  total: number;
  porcentaje: number;
}

export function calcularAreaScores(
  answers: AnswerLite[],
  questions: QuestionLite[],
): Record<Area, AreaScore> {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const init = (): AreaScore => ({ correctas: 0, total: 0, porcentaje: 0 });
  const acc: Record<Area, AreaScore> = {
    logica: init(),
    numerico: init(),
    espacial: init(),
    verbal: init(),
  };
  for (const a of answers) {
    const q = byId.get(a.question_id);
    if (!q) continue;
    acc[q.area].total += 1;
    if (a.es_correcto) acc[q.area].correctas += 1;
  }
  for (const k of Object.keys(acc) as Area[]) {
    const s = acc[k];
    s.porcentaje = s.total > 0 ? Math.round((s.correctas / s.total) * 100) : 0;
  }
  return acc;
}

export const AREA_META: Record<Area, { label: string; color: string; chipClass: string }> = {
  logica: {
    label: "Lógica",
    color: "oklch(55% 0.18 250)",
    chipClass: "bg-[oklch(55%_0.18_250/0.12)] text-[oklch(40%_0.18_250)] border-[oklch(55%_0.18_250/0.3)]",
  },
  numerico: {
    label: "Numérico",
    color: "oklch(55% 0.16 150)",
    chipClass: "bg-[oklch(55%_0.16_150/0.12)] text-[oklch(38%_0.16_150)] border-[oklch(55%_0.16_150/0.3)]",
  },
  espacial: {
    label: "Espacial",
    color: "oklch(55% 0.18 300)",
    chipClass: "bg-[oklch(55%_0.18_300/0.12)] text-[oklch(40%_0.18_300)] border-[oklch(55%_0.18_300/0.3)]",
  },
  verbal: {
    label: "Verbal",
    color: "var(--orange)",
    chipClass: "bg-orange/10 text-orange border-orange/30",
  },
};

/** Detecta si una pregunta debe renderizarse como bloque visual/espacial. */
export function esPreguntaVisual(es_espacial: boolean, pregunta: string): boolean {
  if (es_espacial) return true;
  return /[▲▼◐◑□■★◀▶○●◎✦◒◓]/.test(pregunta);
}
