// SuperMemo-2 spaced repetition algorithm.
// quality: 0..5 (0 = total blackout, 5 = perfect recall)
// Returns updated learning state.

export interface SM2State {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}

export interface SM2Result extends SM2State {
  next_review_at: string; // ISO timestamp
}

export function applySM2(prev: SM2State, quality: number): SM2Result {
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let { ease_factor, interval_days, repetitions } = prev;

  if (q < 3) {
    // Failed recall — reset reps but keep EF (clamped)
    repetitions = 0;
    interval_days = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval_days = 1;
    else if (repetitions === 2) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
  }

  // Update EF (SuperMemo-2 formula)
  ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3;

  const next = new Date();
  next.setDate(next.getDate() + interval_days);

  return {
    ease_factor: Math.round(ease_factor * 100) / 100,
    interval_days,
    repetitions,
    next_review_at: next.toISOString(),
  };
}

export const RATING_LABELS: Record<number, { label: string; hint: string }> = {
  0: { label: "Otra vez", hint: "No me acordaba" },
  3: { label: "Difícil", hint: "Me costó mucho" },
  4: { label: "Bien", hint: "La recordé" },
  5: { label: "Fácil", hint: "Inmediato" },
};
