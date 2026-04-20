-- =========================================
-- Chat persistente: sesiones y mensajes
-- =========================================

CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('document', 'notebook')),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Conversación',
  mode TEXT NOT NULL DEFAULT 'normal' CHECK (mode IN ('normal', 'socratic')),
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chat_session_scope_target CHECK (
    (scope = 'document' AND document_id IS NOT NULL AND notebook_id IS NULL) OR
    (scope = 'notebook' AND notebook_id IS NOT NULL AND document_id IS NULL)
  )
);

CREATE INDEX idx_chat_sessions_user ON public.chat_sessions(user_id, last_message_at DESC);
CREATE INDEX idx_chat_sessions_document ON public.chat_sessions(document_id) WHERE document_id IS NOT NULL;
CREATE INDEX idx_chat_sessions_notebook ON public.chat_sessions(notebook_id) WHERE notebook_id IS NOT NULL;

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id, created_at ASC);

-- =========================================
-- RLS
-- =========================================
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own sessions"
  ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert their sessions"
  ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their sessions"
  ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete their sessions"
  ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users see their messages"
  ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert their messages"
  ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their messages"
  ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- =========================================
-- Trigger: bump session counters al insertar mensaje
-- =========================================
CREATE OR REPLACE FUNCTION public.bump_chat_session_on_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.chat_sessions
     SET message_count = message_count + 1,
         last_message_at = NEW.created_at,
         updated_at = now()
   WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bump_chat_session
AFTER INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.bump_chat_session_on_message();

-- =========================================
-- Trigger genérico de updated_at en sessions
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_chat_sessions_updated
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();