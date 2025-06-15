
-- Fix the infinite recursion in user_roles RLS policies
-- First, let's create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;

-- Create new safe RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Fix the duplicate key constraint issue in user_login_stats
-- Add ON CONFLICT clause to handle duplicate entries
CREATE OR REPLACE FUNCTION public.update_user_login_stats(user_uuid uuid, ip_address text, user_agent text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.user_login_stats (user_id, last_ip, last_user_agent, login_count, last_login_at, first_login_at)
  VALUES (user_uuid, ip_address, user_agent, 1, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    last_ip = EXCLUDED.last_ip,
    last_user_agent = EXCLUDED.last_user_agent,
    login_count = user_login_stats.login_count + 1,
    last_login_at = now();
$$;

-- Enable RLS on all user tables (safe if already enabled)
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_property_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_asset_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for user_property_analyses to ensure they exist
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.user_property_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.user_property_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.user_property_analyses;

CREATE POLICY "Users can view their own analyses" 
  ON public.user_property_analyses 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analyses" 
  ON public.user_property_analyses 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own analyses" 
  ON public.user_property_analyses 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Drop and recreate policies for user_asset_selections to ensure they exist
DROP POLICY IF EXISTS "Users can view their own asset selections" ON public.user_asset_selections;
DROP POLICY IF EXISTS "Users can insert their own asset selections" ON public.user_asset_selections;
DROP POLICY IF EXISTS "Users can update their own asset selections" ON public.user_asset_selections;

CREATE POLICY "Users can view their own asset selections" 
  ON public.user_asset_selections 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own asset selections" 
  ON public.user_asset_selections 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own asset selections" 
  ON public.user_asset_selections 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Drop and recreate policies for user_dashboard_preferences to ensure they exist
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_dashboard_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_dashboard_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_dashboard_preferences;

CREATE POLICY "Users can view their own preferences" 
  ON public.user_dashboard_preferences 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences" 
  ON public.user_dashboard_preferences 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences" 
  ON public.user_dashboard_preferences 
  FOR UPDATE 
  USING (user_id = auth.uid());
