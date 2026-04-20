-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE public.quiz_room_status AS ENUM ('lobby', 'active', 'finished');

-- =====================================================
-- TABLE: quiz_rooms
-- =====================================================
CREATE TABLE public.quiz_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code CHAR(6) NOT NULL UNIQUE,
  status public.quiz_room_status NOT NULL DEFAULT 'lobby',
  host_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE SET NULL,
  quiz_output_id UUID REFERENCES public.document_outputs(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  questions JSONB NOT NULL,
  current_question_index INT NOT NULL DEFAULT -1,
  question_started_at TIMESTAMPTZ,
  seconds_per_question INT NOT NULL DEFAULT 25 CHECK (seconds_per_question BETWEEN 10 AND 60),
  max_participants INT NOT NULL DEFAULT 30 CHECK (max_participants BETWEEN 2 AND 50),
  anti_cheat_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX idx_quiz_rooms_code ON public.quiz_rooms(code);
CREATE INDEX idx_quiz_rooms_host ON public.quiz_rooms(host_user_id);
CREATE INDEX idx_quiz_rooms_status ON public.quiz_rooms(status);

CREATE TRIGGER tg_quiz_rooms_updated_at
  BEFORE UPDATE ON public.quiz_rooms
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.quiz_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rooms"
  ON public.quiz_rooms FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own rooms"
  ON public.quiz_rooms FOR INSERT
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Host can update their room"
  ON public.quiz_rooms FOR UPDATE
  USING (auth.uid() = host_user_id);

CREATE POLICY "Host can delete their room"
  ON public.quiz_rooms FOR DELETE
  USING (auth.uid() = host_user_id);

-- =====================================================
-- TABLE: quiz_room_participants
-- =====================================================
CREATE TABLE public.quiz_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.quiz_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '🎯',
  score INT NOT NULL DEFAULT 0,
  rank INT,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  anti_cheat_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_qrp_room ON public.quiz_room_participants(room_id);
CREATE INDEX idx_qrp_user ON public.quiz_room_participants(user_id);

CREATE TRIGGER tg_qrp_updated_at
  BEFORE UPDATE ON public.quiz_room_participants
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.quiz_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view participants"
  ON public.quiz_room_participants FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can join as themselves"
  ON public.quiz_room_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON public.quiz_room_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Host or self can remove participant"
  ON public.quiz_room_participants FOR DELETE
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT host_user_id FROM public.quiz_rooms WHERE id = room_id)
  );

-- =====================================================
-- TABLE: quiz_attempts (individual play history)
-- =====================================================
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  quiz_output_id UUID REFERENCES public.document_outputs(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.quiz_rooms(id) ON DELETE SET NULL,
  score INT NOT NULL,
  max_score INT NOT NULL,
  time_total_ms INT,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qa_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_qa_room ON public.quiz_attempts(room_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Generate unique 6-char alphanumeric room code (no ambiguous chars)
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_quiz_room_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  _chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I
  _code TEXT;
  _attempt INT := 0;
BEGIN
  LOOP
    _code := '';
    FOR i IN 1..6 LOOP
      _code := _code || substr(_chars, 1 + floor(random() * length(_chars))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.quiz_rooms WHERE code = _code);
    _attempt := _attempt + 1;
    IF _attempt > 20 THEN
      RAISE EXCEPTION 'No se pudo generar un código único';
    END IF;
  END LOOP;
  RETURN _code;
END;
$$;

-- =====================================================
-- REALTIME publication
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_room_participants;

ALTER TABLE public.quiz_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_room_participants REPLICA IDENTITY FULL;