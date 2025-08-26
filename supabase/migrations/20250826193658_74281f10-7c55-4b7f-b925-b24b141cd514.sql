
-- 1) Allow anonymous tracking (user_id nullable) and add session columns
ALTER TABLE public.partner_integration_progress
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.partner_integration_progress
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS user_email text;

-- 2) Helpful indexes for admin queries and grouping/trending
CREATE INDEX IF NOT EXISTS idx_partner_progress_partner_created_at
  ON public.partner_integration_progress (partner_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_progress_session
  ON public.partner_integration_progress (session_id);

CREATE INDEX IF NOT EXISTS idx_partner_progress_user
  ON public.partner_integration_progress (user_id);

-- 3) Enable full-row data for realtime and add to realtime publication
ALTER TABLE public.partner_integration_progress REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_integration_progress;
EXCEPTION WHEN duplicate_object THEN
  -- Already added; ignore
  NULL;
END $$;
