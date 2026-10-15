ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS work_role text,
  ADD COLUMN IF NOT EXISTS work_role_other text,
  ADD COLUMN IF NOT EXISTS daily_tasks text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_work_role_len CHECK (char_length(coalesce(work_role,'')) <= 80 AND char_length(coalesce(work_role_other,'')) <= 80 AND cardinality(daily_tasks) <= 40);