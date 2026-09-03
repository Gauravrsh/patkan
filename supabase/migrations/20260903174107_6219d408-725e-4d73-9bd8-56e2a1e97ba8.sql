CREATE TABLE public.prompt_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_hash text NOT NULL UNIQUE,
  input_text text NOT NULL,
  output_text text NOT NULL,
  engine text NOT NULL DEFAULT 'primary',
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_hit_at timestamptz
);

-- Access is server-side only through the service role; no direct anon/authenticated access.
GRANT ALL ON public.prompt_cache TO service_role;

ALTER TABLE public.prompt_cache ENABLE ROW LEVEL SECURITY;

-- No policies: the table is intentionally inaccessible to anon/authenticated roles.