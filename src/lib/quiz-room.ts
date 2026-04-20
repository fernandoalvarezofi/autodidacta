import { supabase } from "@/integrations/supabase/client";

export interface RoomQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface RoomAnswer {
  question_index: number;
  selected_index: number | null;
  correct: boolean;
  time_ms: number;
  points: number;
}

export interface AntiCheatEvent {
  type: "blur" | "visibility_hidden" | "copy" | "paste";
  question_index: number;
  at: string;
}

const AVATARS = ["🎯", "🚀", "⚡", "🔥", "🌟", "💫", "🎨", "🧠", "🦊", "🐙", "🦄", "🌈", "🍀", "🎲"];

export function pickAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

export function calcPoints(correct: boolean, timeMs: number, totalMs: number): number {
  if (!correct) return 0;
  // 1000 base + bonus por velocidad (hasta +500)
  const remaining = Math.max(0, totalMs - timeMs);
  const speedBonus = Math.round((remaining / totalMs) * 500);
  return 1000 + speedBonus;
}

export async function createRoom(params: {
  hostUserId: string;
  quizOutputId: string;
  documentId: string | null;
  notebookId: string | null;
  quizTitle: string;
  questions: RoomQuestion[];
  secondsPerQuestion?: number;
}): Promise<{ id: string; code: string }> {
  // Generar código vía RPC
  const { data: codeData, error: codeErr } = await supabase.rpc("generate_quiz_room_code");
  if (codeErr || !codeData) throw codeErr ?? new Error("No se pudo generar código");

  const { data, error } = await supabase
    .from("quiz_rooms")
    .insert({
      code: codeData as string,
      host_user_id: params.hostUserId,
      quiz_output_id: params.quizOutputId,
      document_id: params.documentId,
      notebook_id: params.notebookId,
      quiz_title: params.quizTitle,
      questions: params.questions as unknown as never,
      seconds_per_question: params.secondsPerQuestion ?? 25,
      status: "lobby",
    })
    .select("id, code")
    .single();
  if (error || !data) throw error ?? new Error("No se pudo crear la sala");
  return data as { id: string; code: string };
}

export async function joinRoom(params: {
  roomId: string;
  userId: string;
  displayName: string;
  avatar: string;
}) {
  const { error } = await supabase.from("quiz_room_participants").upsert(
    {
      room_id: params.roomId,
      user_id: params.userId,
      display_name: params.displayName,
      avatar_emoji: params.avatar,
      is_ready: false,
      score: 0,
      answers: [] as unknown as never,
    },
    { onConflict: "room_id,user_id" },
  );
  if (error) throw error;
}

export async function findRoomByCode(code: string) {
  const { data, error } = await supabase
    .from("quiz_rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}
