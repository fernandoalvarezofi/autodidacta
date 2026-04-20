CREATE OR REPLACE FUNCTION public.award_xp(_amount integer)
RETURNS TABLE(xp integer, streak_days integer, level text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _today date := CURRENT_DATE;
  _last date;
  _new_streak int;
  _new_xp int;
  _new_level text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;
  IF _amount IS NULL OR _amount < 0 OR _amount > 1000 THEN
    RAISE EXCEPTION 'Monto de XP inválido';
  END IF;

  SELECT p.last_activity_date, p.streak_days
    INTO _last, _new_streak
  FROM public.profiles p
  WHERE p.id = _uid;

  IF _last IS NULL OR _last < _today - INTERVAL '1 day' THEN
    _new_streak := 1;
  ELSIF _last = _today - INTERVAL '1 day' THEN
    _new_streak := COALESCE(_new_streak, 0) + 1;
  END IF;
  -- if _last = _today, keep streak unchanged

  UPDATE public.profiles
     SET xp = COALESCE(xp, 0) + _amount,
         streak_days = _new_streak,
         last_activity_date = _today,
         level = CASE
                   WHEN COALESCE(xp, 0) + _amount >= 5000 THEN 'Sabio'
                   WHEN COALESCE(xp, 0) + _amount >= 2000 THEN 'Maestro'
                   WHEN COALESCE(xp, 0) + _amount >= 700  THEN 'Erudito'
                   WHEN COALESCE(xp, 0) + _amount >= 200  THEN 'Estudioso'
                   ELSE 'Aprendiz'
                 END,
         updated_at = NOW()
   WHERE id = _uid
   RETURNING profiles.xp, profiles.streak_days, profiles.level
   INTO _new_xp, _new_streak, _new_level;

  RETURN QUERY SELECT _new_xp, _new_streak, _new_level;
END;
$$;

REVOKE ALL ON FUNCTION public.award_xp(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_xp(integer) TO authenticated;