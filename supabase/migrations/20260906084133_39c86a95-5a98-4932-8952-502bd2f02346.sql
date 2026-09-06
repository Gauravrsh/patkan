CREATE TABLE public.page_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  visitor_hash text NOT NULL,
  path text NOT NULL DEFAULT '/',
  event text NOT NULL,
  section text,
  value_int integer,
  device text,
  referrer_host text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT ALL ON public.page_events TO service_role;
ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX page_events_created_at_idx ON public.page_events (created_at DESC);
CREATE INDEX page_events_session_idx ON public.page_events (session_id);
CREATE INDEX page_events_event_idx ON public.page_events (event);

CREATE TABLE public.extension_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  subject_hash text NOT NULL,
  event text NOT NULL,
  host text,
  surface text,
  reason text,
  value_int integer,
  version text
);
GRANT ALL ON public.extension_events TO service_role;
ALTER TABLE public.extension_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX extension_events_created_at_idx ON public.extension_events (created_at DESC);
CREATE INDEX extension_events_event_idx ON public.extension_events (event);