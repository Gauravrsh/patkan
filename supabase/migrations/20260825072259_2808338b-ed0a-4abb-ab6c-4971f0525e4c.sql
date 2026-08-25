CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.field_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field text NOT NULL,
  value text NOT NULL,
  value_norm text NOT NULL,
  uses integer NOT NULL DEFAULT 1,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (field, value_norm)
);

CREATE INDEX field_suggestions_prefix_idx
  ON public.field_suggestions (field, value_norm text_pattern_ops);
CREATE INDEX field_suggestions_trgm_idx
  ON public.field_suggestions USING gin (value_norm gin_trgm_ops);

CREATE TABLE public.field_ngrams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field text NOT NULL,
  prefix text NOT NULL,
  next_word text NOT NULL,
  uses integer NOT NULL DEFAULT 1,
  UNIQUE (field, prefix, next_word)
);

CREATE INDEX field_ngrams_lookup_idx ON public.field_ngrams (field, prefix, uses DESC);

GRANT SELECT ON public.field_suggestions TO anon, authenticated;
GRANT ALL ON public.field_suggestions TO service_role;
GRANT SELECT ON public.field_ngrams TO anon, authenticated;
GRANT ALL ON public.field_ngrams TO service_role;

ALTER TABLE public.field_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_ngrams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read established suggestions"
  ON public.field_suggestions FOR SELECT TO anon, authenticated
  USING (uses >= 2);

CREATE POLICY "Public can read established ngrams"
  ON public.field_ngrams FOR SELECT TO anon, authenticated
  USING (uses >= 2);

CREATE OR REPLACE FUNCTION public.normalize_field_value(_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT lower(btrim(regexp_replace(coalesce(_value, ''), '\s+', ' ', 'g')));
$$;

CREATE OR REPLACE FUNCTION public.is_valid_field_value(_value text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v text := public.normalize_field_value(_value);
BEGIN
  IF v IS NULL OR length(v) < 3 OR length(v) > 160 THEN RETURN false; END IF;
  IF v ~ '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[a-z]{2,}' THEN RETURN false; END IF;
  IF v ~ '(https?://|www\.)' THEN RETURN false; END IF;
  IF v ~ '[0-9]{7,}' THEN RETURN false; END IF;
  IF v ~ '(sk-|pk-|api[_ -]?key|bearer |secret[_ -]?key)' THEN RETURN false; END IF;
  IF v ~ '[a-z0-9_-]{32,}' THEN RETURN false; END IF;
  IF v ~ '\y(fuck|shit|cunt|bitch|asshole|bastard|nigger|faggot|retard|whore)\y' THEN RETURN false; END IF;
  IF v ~ '^\[.*\]$' THEN RETURN false; END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_field_usage(_field text, _value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v text;
  words text[];
  i integer;
  pfx text;
BEGIN
  IF _field IS NULL OR _field NOT IN ('role', 'scenario', 'objective') THEN
    RETURN;
  END IF;

  v := btrim(regexp_replace(coalesce(_value, ''), '\s+', ' ', 'g'));

  IF NOT public.is_valid_field_value(v) THEN
    RETURN;
  END IF;

  INSERT INTO public.field_suggestions (field, value, value_norm, uses, last_used_at)
  VALUES (_field, v, public.normalize_field_value(v), 1, now())
  ON CONFLICT (field, value_norm) DO UPDATE
    SET uses = public.field_suggestions.uses + 1,
        last_used_at = now();

  words := string_to_array(public.normalize_field_value(v), ' ');

  IF array_length(words, 1) IS NULL THEN RETURN; END IF;

  FOR i IN 2 .. array_length(words, 1) LOOP
    pfx := words[i - 1];
    INSERT INTO public.field_ngrams (field, prefix, next_word, uses)
    VALUES (_field, pfx, words[i], 1)
    ON CONFLICT (field, prefix, next_word) DO UPDATE
      SET uses = public.field_ngrams.uses + 1;

    IF i >= 3 THEN
      pfx := words[i - 2] || ' ' || words[i - 1];
      INSERT INTO public.field_ngrams (field, prefix, next_word, uses)
      VALUES (_field, pfx, words[i], 1)
      ON CONFLICT (field, prefix, next_word) DO UPDATE
        SET uses = public.field_ngrams.uses + 1;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.record_field_usage(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_field_usage(text, text) TO anon, authenticated, service_role;

INSERT INTO public.field_suggestions (field, value, value_norm, uses)
SELECT f, v, public.normalize_field_value(v), 2
FROM (VALUES
  ('role', 'Senior Solutions Architect'),
  ('role', 'Senior Software Engineer'),
  ('role', 'Staff Backend Engineer'),
  ('role', 'Senior Frontend Engineer'),
  ('role', 'Principal Data Engineer'),
  ('role', 'Forensic Data Analyst'),
  ('role', 'Growth Copywriter'),
  ('role', 'Product Manager'),
  ('role', 'Technical Product Manager'),
  ('role', 'DevOps and Platform Engineer'),
  ('role', 'Site Reliability Engineer'),
  ('role', 'Security Engineer'),
  ('role', 'Machine Learning Engineer'),
  ('role', 'Database Administrator'),
  ('role', 'UX Researcher'),
  ('role', 'UI/UX Designer'),
  ('role', 'Technical Writer'),
  ('role', 'Financial Analyst'),
  ('role', 'Management Consultant'),
  ('role', 'Corporate Lawyer'),
  ('role', 'Marketing Strategist'),
  ('role', 'SEO Specialist'),
  ('role', 'Sales Enablement Lead'),
  ('role', 'Business Analyst'),
  ('role', 'QA Automation Engineer'),
  ('role', 'Mobile Application Developer'),
  ('role', 'Cloud Infrastructure Architect'),
  ('role', 'Data Scientist'),
  ('role', 'Systems Integration Engineer'),
  ('role', 'Enterprise Risk Manager'),
  ('scenario', 'building a full-stack collections app for enterprise banks'),
  ('scenario', 'building a SaaS analytics dashboard for mid-market retailers'),
  ('scenario', 'migrating a monolith to microservices on AWS'),
  ('scenario', 'launching a mobile-first marketplace for local services'),
  ('scenario', 'designing an internal tooling platform for operations teams'),
  ('scenario', 'rebuilding a legacy reporting pipeline in Postgres'),
  ('scenario', 'scaling an e-commerce checkout under peak traffic'),
  ('scenario', 'preparing a SOC2 audit for a fintech startup'),
  ('scenario', 'launching a B2B onboarding flow for enterprise clients'),
  ('scenario', 'building an AI assistant on top of internal documentation'),
  ('scenario', 'consolidating customer data into a single warehouse'),
  ('scenario', 'redesigning the pricing page for a subscription product'),
  ('scenario', 'automating invoice reconciliation for a lending business'),
  ('scenario', 'setting up CI/CD for a multi-repo frontend estate'),
  ('scenario', 'writing go-to-market content for a developer tool'),
  ('objective', 'design a step-by-step database schema and API routing spec'),
  ('objective', 'audit the existing architecture and list critical risks'),
  ('objective', 'refactor the module for testability and clear boundaries'),
  ('objective', 'draft a technical implementation plan with milestones'),
  ('objective', 'produce a migration plan with rollback checkpoints'),
  ('objective', 'write a detailed test strategy covering edge cases'),
  ('objective', 'create a data model with indexes and access patterns'),
  ('objective', 'diagnose the root cause and propose a durable fix'),
  ('objective', 'benchmark the options and recommend one with trade-offs'),
  ('objective', 'write production-ready code with inline documentation'),
  ('objective', 'outline a security review checklist for the release'),
  ('objective', 'draft user-facing copy for the onboarding sequence'),
  ('objective', 'build a cost model comparing the deployment options'),
  ('objective', 'define the rollout plan with feature flags and metrics'),
  ('objective', 'summarize the trade-offs into an executive brief')
) AS seed(f, v)
ON CONFLICT (field, value_norm) DO NOTHING;

DO $seed$
DECLARE
  r record;
  words text[];
  i integer;
BEGIN
  FOR r IN SELECT field, value_norm FROM public.field_suggestions LOOP
    words := string_to_array(r.value_norm, ' ');
    IF array_length(words, 1) IS NULL THEN CONTINUE; END IF;
    FOR i IN 2 .. array_length(words, 1) LOOP
      INSERT INTO public.field_ngrams (field, prefix, next_word, uses)
      VALUES (r.field, words[i - 1], words[i], 2)
      ON CONFLICT (field, prefix, next_word) DO UPDATE
        SET uses = public.field_ngrams.uses + 1;
      IF i >= 3 THEN
        INSERT INTO public.field_ngrams (field, prefix, next_word, uses)
        VALUES (r.field, words[i - 2] || ' ' || words[i - 1], words[i], 2)
        ON CONFLICT (field, prefix, next_word) DO UPDATE
          SET uses = public.field_ngrams.uses + 1;
      END IF;
    END LOOP;
  END LOOP;
END
$seed$;