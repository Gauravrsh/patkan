-- 1. Roles ------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- 2. Atomic quota -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_quota(_subject_key TEXT, _day DATE, _limit INTEGER)
RETURNS TABLE (allowed BOOLEAN, used INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.usage_counters (subject_key, day, count)
  VALUES (_subject_key, _day, 1)
  ON CONFLICT (subject_key, day) DO UPDATE
    SET count = public.usage_counters.count + 1, updated_at = now()
    WHERE public.usage_counters.count < _limit
  RETURNING public.usage_counters.count INTO v_count;

  IF v_count IS NULL THEN
    SELECT c.count INTO v_count
    FROM public.usage_counters c
    WHERE c.subject_key = _subject_key AND c.day = _day;
    RETURN QUERY SELECT false, COALESCE(v_count, 0);
  ELSE
    RETURN QUERY SELECT true, v_count;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_quota(TEXT, DATE, INTEGER) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.merge_device_usage(_device_key TEXT, _user_key TEXT, _day DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_device INTEGER;
  v_total INTEGER;
BEGIN
  SELECT count INTO v_device FROM public.usage_counters WHERE subject_key = _device_key AND day = _day;
  IF v_device IS NULL OR v_device = 0 THEN
    SELECT COALESCE(count, 0) INTO v_total FROM public.usage_counters WHERE subject_key = _user_key AND day = _day;
    RETURN COALESCE(v_total, 0);
  END IF;

  INSERT INTO public.usage_counters (subject_key, day, count)
  VALUES (_user_key, _day, v_device)
  ON CONFLICT (subject_key, day) DO UPDATE
    SET count = public.usage_counters.count + v_device, updated_at = now()
  RETURNING count INTO v_total;

  DELETE FROM public.usage_counters WHERE subject_key = _device_key AND day = _day;
  RETURN v_total;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.merge_device_usage(TEXT, TEXT, DATE) FROM PUBLIC, anon, authenticated;

-- 3. Observability ----------------------------------------------------------
CREATE TABLE public.transform_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  subject_kind TEXT NOT NULL,
  subject_hash TEXT NOT NULL,
  host TEXT,
  surface TEXT NOT NULL DEFAULT 'web',
  persona TEXT,
  dialect TEXT,
  intensity TEXT,
  intent TEXT,
  engine TEXT,
  cached BOOLEAN NOT NULL DEFAULT false,
  input_chars INTEGER NOT NULL DEFAULT 0,
  output_chars INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER,
  ttfb_ms INTEGER,
  outcome TEXT NOT NULL DEFAULT 'ok',
  accepted BOOLEAN
);

GRANT ALL ON public.transform_events TO service_role;
ALTER TABLE public.transform_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX transform_events_created_idx ON public.transform_events (created_at DESC);
CREATE INDEX transform_events_subject_idx ON public.transform_events (subject_hash, created_at DESC);