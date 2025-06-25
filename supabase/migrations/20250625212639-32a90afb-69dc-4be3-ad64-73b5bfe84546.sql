
-- First, create the missing tables that are referenced by the functions

-- Create user_onboarding table
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  onboarding_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bundle_configurations table
CREATE TABLE IF NOT EXISTS public.bundle_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  asset_requirements TEXT[] DEFAULT '{}',
  min_assets INTEGER DEFAULT 1,
  max_providers_per_asset INTEGER DEFAULT 3,
  total_setup_cost NUMERIC DEFAULT 0,
  total_monthly_earnings_low NUMERIC DEFAULT 0,
  total_monthly_earnings_high NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partner recommendations table
CREATE TABLE IF NOT EXISTS public.partner_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL,
  partner_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  priority_score INTEGER DEFAULT 0,
  estimated_monthly_earnings NUMERIC DEFAULT 0,
  setup_complexity TEXT DEFAULT 'medium',
  recommendation_reason TEXT,
  referral_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partner integration progress table
CREATE TABLE IF NOT EXISTS public.partner_integration_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  onboarding_id UUID NOT NULL,
  partner_name TEXT NOT NULL,
  referral_link TEXT,
  integration_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create onboarding messages table
CREATE TABLE IF NOT EXISTS public.onboarding_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Now create the RPC functions
CREATE OR REPLACE FUNCTION public.get_bundle_configurations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  asset_requirements TEXT[],
  min_assets INTEGER,
  max_providers_per_asset INTEGER,
  total_setup_cost NUMERIC,
  total_monthly_earnings_low NUMERIC,
  total_monthly_earnings_high NUMERIC,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bc.id,
    bc.name,
    bc.description,
    bc.asset_requirements,
    bc.min_assets,
    bc.max_providers_per_asset,
    bc.total_setup_cost,
    bc.total_monthly_earnings_low,
    bc.total_monthly_earnings_high,
    bc.is_active,
    bc.created_at,
    bc.updated_at
  FROM public.bundle_configurations bc
  WHERE bc.is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_onboarding_data(user_id UUID)
RETURNS TABLE (
  onboarding_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT uo.onboarding_data
  FROM public.user_onboarding uo
  WHERE uo.user_id = get_user_onboarding_data.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_user_onboarding_data(user_id UUID, onboarding_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_id UUID;
BEGIN
  INSERT INTO public.user_onboarding (user_id, onboarding_data, updated_at)
  VALUES (user_id, onboarding_data, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    onboarding_data = EXCLUDED.onboarding_data,
    updated_at = now()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$;

-- Add RLS policies
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_integration_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own onboarding data" 
  ON public.user_onboarding 
  FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Public read access to bundle configurations" 
  ON public.bundle_configurations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Public read access to partner recommendations" 
  ON public.partner_recommendations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Public write access to partner recommendations" 
  ON public.partner_recommendations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can manage their own integration progress" 
  ON public.partner_integration_progress 
  FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Public read access to onboarding messages" 
  ON public.onboarding_messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Public write access to onboarding messages" 
  ON public.onboarding_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON public.user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_recommendations_onboarding_id ON public.partner_recommendations(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_partner_integration_progress_user_id ON public.partner_integration_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_messages_onboarding_id ON public.onboarding_messages(onboarding_id);
