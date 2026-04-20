CREATE OR REPLACE FUNCTION public.generate_quiz_room_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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