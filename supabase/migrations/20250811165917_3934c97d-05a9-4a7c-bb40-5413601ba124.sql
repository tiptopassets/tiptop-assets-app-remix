-- Enable RLS and add user-scoped policies for key tables

-- user_onboarding
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_onboarding' AND policyname='Users can view their onboarding'
  ) THEN
    CREATE POLICY "Users can view their onboarding"
    ON public.user_onboarding FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_onboarding' AND policyname='Users can insert their onboarding'
  ) THEN
    CREATE POLICY "Users can insert their onboarding"
    ON public.user_onboarding FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_onboarding' AND policyname='Users can update their onboarding'
  ) THEN
    CREATE POLICY "Users can update their onboarding"
    ON public.user_onboarding FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- user_service_selections
ALTER TABLE public.user_service_selections ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_service_selections' AND policyname='Users can view their service selections'
  ) THEN
    CREATE POLICY "Users can view their service selections"
    ON public.user_service_selections FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_service_selections' AND policyname='Users can insert their service selections'
  ) THEN
    CREATE POLICY "Users can insert their service selections"
    ON public.user_service_selections FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_service_selections' AND policyname='Users can update their service selections'
  ) THEN
    CREATE POLICY "Users can update their service selections"
    ON public.user_service_selections FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- user_supplier_connections
ALTER TABLE public.user_supplier_connections ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_supplier_connections' AND policyname='Users can view their supplier connections'
  ) THEN
    CREATE POLICY "Users can view their supplier connections"
    ON public.user_supplier_connections FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_supplier_connections' AND policyname='Users can insert their supplier connections'
  ) THEN
    CREATE POLICY "Users can insert their supplier connections"
    ON public.user_supplier_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_supplier_connections' AND policyname='Users can update their supplier connections'
  ) THEN
    CREATE POLICY "Users can update their supplier connections"
    ON public.user_supplier_connections FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- partner_integration_progress
ALTER TABLE public.partner_integration_progress ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partner_integration_progress' AND policyname='Users can view their partner integration progress'
  ) THEN
    CREATE POLICY "Users can view their partner integration progress"
    ON public.partner_integration_progress FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partner_integration_progress' AND policyname='Users can insert their partner integration progress'
  ) THEN
    CREATE POLICY "Users can insert their partner integration progress"
    ON public.partner_integration_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partner_integration_progress' AND policyname='Users can update their partner integration progress'
  ) THEN
    CREATE POLICY "Users can update their partner integration progress"
    ON public.partner_integration_progress FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- user_property_images
ALTER TABLE public.user_property_images ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_property_images' AND policyname='Users can view their property images'
  ) THEN
    CREATE POLICY "Users can view their property images"
    ON public.user_property_images FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_property_images' AND policyname='Users can insert their property images'
  ) THEN
    CREATE POLICY "Users can insert their property images"
    ON public.user_property_images FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_property_images' AND policyname='Users can update their property images'
  ) THEN
    CREATE POLICY "Users can update their property images"
    ON public.user_property_images FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- user_journey_progress (supports anonymous like user_journey_complete)
ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_journey_progress' AND policyname='Allow anonymous journey progress inserts'
  ) THEN
    CREATE POLICY "Allow anonymous journey progress inserts"
    ON public.user_journey_progress FOR INSERT
    WITH CHECK (((auth.uid() IS NULL AND user_id IS NULL) OR auth.uid() = user_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_journey_progress' AND policyname='Allow journey progress viewing'
  ) THEN
    CREATE POLICY "Allow journey progress viewing"
    ON public.user_journey_progress FOR SELECT
    USING (((user_id IS NULL) OR (auth.uid() = user_id)));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_journey_progress' AND policyname='Allow journey progress updates'
  ) THEN
    CREATE POLICY "Allow journey progress updates"
    ON public.user_journey_progress FOR UPDATE
    USING (((user_id IS NULL) OR (auth.uid() = user_id)));
  END IF;
END $$;

-- visitor_sessions (anonymous-friendly)
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='visitor_sessions' AND policyname='Allow anonymous visitor session inserts'
  ) THEN
    CREATE POLICY "Allow anonymous visitor session inserts"
    ON public.visitor_sessions FOR INSERT
    WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='visitor_sessions' AND policyname='Allow visitor session viewing'
  ) THEN
    CREATE POLICY "Allow visitor session viewing"
    ON public.visitor_sessions FOR SELECT
    USING ((user_id IS NULL) OR (auth.uid() = user_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='visitor_sessions' AND policyname='Allow visitor session updates'
  ) THEN
    CREATE POLICY "Allow visitor session updates"
    ON public.visitor_sessions FOR UPDATE
    USING ((user_id IS NULL) OR (auth.uid() = user_id));
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON public.user_onboarding (user_id);
CREATE INDEX IF NOT EXISTS idx_partner_integration_progress_user_id ON public.partner_integration_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_service_selections_user_id ON public.user_service_selections (user_id);
CREATE INDEX IF NOT EXISTS idx_user_supplier_connections_user_id ON public.user_supplier_connections (user_id);
CREATE INDEX IF NOT EXISTS idx_user_property_images_user_id ON public.user_property_images (user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_user_id ON public.visitor_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON public.visitor_sessions (session_id);
