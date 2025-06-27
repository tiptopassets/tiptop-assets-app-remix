
-- Security fixes migration - Phase 1: Critical RLS Implementation
-- Handle existing policies gracefully

-- 1. Create security definer function to check admin status (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Enable RLS on tables that don't have it enabled
DO $$ 
BEGIN
  -- Enable RLS only if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'affiliate_credentials' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.affiliate_credentials ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'affiliate_earnings' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_login_stats' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_login_stats ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_journey_progress' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_service_selections' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_service_selections ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 3. Create or replace RLS policies for affiliate_credentials
DROP POLICY IF EXISTS "Users can view their own credentials" ON public.affiliate_credentials;
DROP POLICY IF EXISTS "Users can manage their own credentials" ON public.affiliate_credentials;

CREATE POLICY "Users can view their own credentials" 
  ON public.affiliate_credentials FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own credentials" 
  ON public.affiliate_credentials FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials" 
  ON public.affiliate_credentials FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own credentials" 
  ON public.affiliate_credentials FOR DELETE 
  USING (auth.uid() = user_id OR public.is_admin());

-- 4. Create or replace RLS policies for affiliate_earnings
DROP POLICY IF EXISTS "Users can view their own earnings" ON public.affiliate_earnings;
DROP POLICY IF EXISTS "Users can insert their own earnings" ON public.affiliate_earnings;

CREATE POLICY "Users can view their own earnings" 
  ON public.affiliate_earnings FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own earnings" 
  ON public.affiliate_earnings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own earnings" 
  ON public.affiliate_earnings FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own earnings" 
  ON public.affiliate_earnings FOR DELETE 
  USING (auth.uid() = user_id OR public.is_admin());

-- 5. Create RLS policies for user_login_stats
DROP POLICY IF EXISTS "Users can view their own login stats" ON public.user_login_stats;
DROP POLICY IF EXISTS "Users can insert their own login stats" ON public.user_login_stats;
DROP POLICY IF EXISTS "Users can update their own login stats" ON public.user_login_stats;

CREATE POLICY "Users can view their own login stats" 
  ON public.user_login_stats FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own login stats" 
  ON public.user_login_stats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own login stats" 
  ON public.user_login_stats FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin());

-- 6. Create RLS policies for user_journey_progress
DROP POLICY IF EXISTS "Users can view their own journey progress" ON public.user_journey_progress;
DROP POLICY IF EXISTS "Users can insert their own journey progress" ON public.user_journey_progress;
DROP POLICY IF EXISTS "Users can update their own journey progress" ON public.user_journey_progress;
DROP POLICY IF EXISTS "Users can delete their own journey progress" ON public.user_journey_progress;

CREATE POLICY "Users can view their own journey progress" 
  ON public.user_journey_progress FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own journey progress" 
  ON public.user_journey_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journey progress" 
  ON public.user_journey_progress FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own journey progress" 
  ON public.user_journey_progress FOR DELETE 
  USING (auth.uid() = user_id OR public.is_admin());

-- 7. Create RLS policies for user_service_selections
DROP POLICY IF EXISTS "Users can view their own service selections" ON public.user_service_selections;
DROP POLICY IF EXISTS "Users can insert their own service selections" ON public.user_service_selections;
DROP POLICY IF EXISTS "Users can update their own service selections" ON public.user_service_selections;
DROP POLICY IF EXISTS "Users can delete their own service selections" ON public.user_service_selections;

CREATE POLICY "Users can view their own service selections" 
  ON public.user_service_selections FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own service selections" 
  ON public.user_service_selections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service selections" 
  ON public.user_service_selections FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own service selections" 
  ON public.user_service_selections FOR DELETE 
  USING (auth.uid() = user_id OR public.is_admin());

-- 8. Enhance existing policies with admin access
-- Update existing policies to include admin access where missing
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.user_addresses;
CREATE POLICY "Users can view their own addresses" 
  ON public.user_addresses FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.user_addresses;
CREATE POLICY "Users can insert their own addresses" 
  ON public.user_addresses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses" ON public.user_addresses;
CREATE POLICY "Users can update their own addresses" 
  ON public.user_addresses FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.user_addresses;
CREATE POLICY "Users can delete their own addresses" 
  ON public.user_addresses FOR DELETE 
  USING (auth.uid() = user_id OR public.is_admin());

-- 9. Secure admin role management
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

CREATE POLICY "Admins and users can view relevant roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admins can modify user roles" 
  ON public.user_roles FOR ALL 
  USING (public.is_admin());

-- 10. Create audit logging for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
  ON public.admin_audit_log FOR SELECT 
  USING (public.is_admin());

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs" 
  ON public.admin_audit_log FOR INSERT 
  WITH CHECK (public.is_admin());
