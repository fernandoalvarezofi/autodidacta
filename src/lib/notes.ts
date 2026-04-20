import { supabase } from "@/integrations/supabase/client";

export interface NoteRow {
  id: string;
  user_id: string;
  notebook_id: string | null;
  document_id: string | null;
  title: string;
  content_html: string;
  content_json: unknown;
  template_key: string | null;
  cover_color: string | null;
  emoji: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
}

export async function createNote(params: {
  userId: string;
  notebookId: string | null;
  documentId: string | null;
  title: string;
  contentHtml: string;
  contentJson: unknown;
  templateKey: string | null;
  emoji?: string;
  coverColor?: string;
}): Promise<NoteRow> {
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: params.userId,
      notebook_id: params.notebookId,
      document_id: params.documentId,
      title: params.title,
      content_html: params.contentHtml,
      content_json: params.contentJson as never,
      template_key: params.templateKey,
      emoji: params.emoji ?? "📝",
      cover_color: params.coverColor ?? "cream",
      word_count: countWords(params.contentHtml),
    })
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("No se pudo crear la nota");
  return data as NoteRow;
}

export async function updateNote(
  id: string,
  patch: Partial<{
    title: string;
    content_html: string;
    content_json: unknown;
    emoji: string;
    cover_color: string;
  }>,
): Promise<void> {
  const update: Record<string, unknown> = { ...patch };
  if (typeof patch.content_html === "string") {
    update.word_count = countWords(patch.content_html);
  }
  const { error } = await supabase.from("notes").update(update).eq("id", id);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}

export async function listNotesByNotebook(notebookId: string): Promise<NoteRow[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("notebook_id", notebookId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as NoteRow[];
}
