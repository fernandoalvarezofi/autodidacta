import { supabase } from "@/integrations/supabase/client";

export type ChatScope = "document" | "notebook";
export type ChatMode = "normal" | "socratic";
export type ChatRole = "user" | "assistant" | "system";

export interface ChatSession {
  id: string;
  user_id: string;
  scope: ChatScope;
  document_id: string | null;
  notebook_id: string | null;
  title: string;
  mode: ChatMode;
  message_count: number;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  citations: unknown;
  tokens_used: number | null;
  created_at: string;
}

export async function listSessions(scope: ChatScope, contextId: string): Promise<ChatSession[]> {
  const col = scope === "document" ? "document_id" : "notebook_id";
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq(col, contextId)
    .order("last_message_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChatSession[];
}

export async function createSession(params: {
  userId: string;
  scope: ChatScope;
  contextId: string;
  title?: string;
  mode?: ChatMode;
}): Promise<ChatSession> {
  const insert = {
    user_id: params.userId,
    scope: params.scope,
    document_id: params.scope === "document" ? params.contextId : null,
    notebook_id: params.scope === "notebook" ? params.contextId : null,
    title: params.title ?? "Nueva conversación",
    mode: params.mode ?? "normal",
  };
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert(insert)
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("No se pudo crear la sesión");
  return data as ChatSession;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
  if (error) throw error;
}

export async function renameSession(id: string, title: string): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ title: title.trim() || "Conversación" })
    .eq("id", id);
  if (error) throw error;
}

export async function updateSessionMode(id: string, mode: ChatMode): Promise<void> {
  const { error } = await supabase.from("chat_sessions").update({ mode }).eq("id", id);
  if (error) throw error;
}

export async function listMessages(sessionId: string): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChatMessageRow[];
}

export async function insertMessage(params: {
  userId: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  citations?: unknown;
  tokensUsed?: number;
}): Promise<ChatMessageRow> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      user_id: params.userId,
      session_id: params.sessionId,
      role: params.role,
      content: params.content,
      citations: (params.citations ?? []) as never,
      tokens_used: params.tokensUsed ?? null,
    })
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("No se pudo guardar el mensaje");
  return data as ChatMessageRow;
}

/**
 * Genera un título corto a partir de la primera pregunta del usuario.
 */
export function autoTitleFromQuestion(question: string): string {
  const trimmed = question.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 48) return trimmed;
  return trimmed.slice(0, 45).trimEnd() + "…";
}
