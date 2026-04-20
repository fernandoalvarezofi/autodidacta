-- Notas editables del usuario (editor visual tipo Canva)
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Nota sin título',
  content_html TEXT NOT NULL DEFAULT '',
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  template_key TEXT,
  cover_color TEXT DEFAULT 'cream',
  emoji TEXT DEFAULT '📝',
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_user ON public.notes(user_id, updated_at DESC);
CREATE INDEX idx_notes_notebook ON public.notes(notebook_id, updated_at DESC) WHERE notebook_id IS NOT NULL;
CREATE INDEX idx_notes_document ON public.notes(document_id) WHERE document_id IS NOT NULL;

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER notes_set_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();