import { supabase } from "@/integrations/supabase/client";
import type { ChatScope, ChatMode } from "@/lib/chat-sessions";

export interface ChatStreamSource {
  index: number;
  page: number | null;
  excerpt: string;
  documentId?: string;
  documentTitle?: string;
  chunkId?: string;
}

export interface ChatStreamHandlers {
  onMeta?: (sources: ChatStreamSource[], usedGeneralKnowledge: boolean) => void;
  onDelta?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

/**
 * Llama a la edge function chat-document o chat-notebook con SSE streaming.
 * Devuelve una promise que se resuelve cuando termina el stream.
 */
export async function streamChat(
  scope: ChatScope,
  params: {
    contextId: string;
    sessionId: string;
    question: string;
    mode: ChatMode;
  },
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Sesión expirada. Volvé a iniciar sesión.");

  const fnName = scope === "document" ? "chat-document" : "chat-notebook";
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fnName}`;

  const body =
    scope === "document"
      ? {
          documentId: params.contextId,
          question: params.question,
          sessionId: params.sessionId,
          mode: params.mode,
        }
      : {
          notebookId: params.contextId,
          question: params.question,
          sessionId: params.sessionId,
          mode: params.mode,
        };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error ?? msg;
    } catch {
      // ignore
    }
    handlers.onError?.(msg);
    return;
  }

  if (!res.body) {
    handlers.onError?.("Sin respuesta del servidor");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload) continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "delta" && typeof evt.content === "string") {
            handlers.onDelta?.(evt.content);
          } else if (evt.type === "meta") {
            handlers.onMeta?.(evt.sources ?? [], !!evt.usedGeneralKnowledge);
          } else if (evt.type === "done") {
            handlers.onDone?.();
          } else if (evt.type === "error") {
            handlers.onError?.(evt.message ?? "Error en el stream");
          }
        } catch {
          // ignore parse errors
        }
      }
    }
    handlers.onDone?.();
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    handlers.onError?.(e instanceof Error ? e.message : String(e));
  }
}
