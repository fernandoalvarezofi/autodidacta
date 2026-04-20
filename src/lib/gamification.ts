import { supabase } from "@/integrations/supabase/client";

export interface XpResult {
  xp: number;
  streak_days: number;
  level: string;
}

/**
 * Awards XP and updates streak via the `award_xp` Postgres function.
 * Silent on failure — gamification should never block the UX.
 */
export async function awardXp(amount: number): Promise<XpResult | null> {
  if (amount <= 0) return null;
  // Cast: the generated types don't yet include this RPC.
  const { data, error } = await (supabase.rpc as unknown as (
    fn: string,
    args: { _amount: number },
  ) => Promise<{ data: XpResult[] | null; error: unknown }>)("award_xp", { _amount: amount });

  if (error || !data || data.length === 0) {
    console.warn("[awardXp] failed", error);
    return null;
  }
  return data[0];
}

export const XP = {
  flashcardCorrect: 5,
  flashcardWrong: 2, // attempt still counts a little
  reviewSessionComplete: 15,
  quizCorrect: 8,
  quizComplete: 20,
} as const;
