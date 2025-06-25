
-- Create comprehensive user journey tracking system

-- First, enhance the visitor_sessions table with journey tracking
ALTER TABLE public.visitor_sessions 
ADD COLUMN IF NOT EXISTS journey_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS address_entered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS analysis_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS services_viewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS options_selected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auth_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dashboard_accessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS property_address TEXT,
ADD COLUMN IF NOT EXISTS analysis_data JSONB,
ADD COLUMN IF NOT EXISTS selected_services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS selected_option TEXT,
ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

-- Create a comprehensive user journey table that consolidates all user activity
CREATE TABLE public.user_journey_complete (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  
  -- Journey progression tracking
  current_step TEXT DEFAULT 'site_entry',
  journey_start_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  journey_complete_at TIMESTAMP WITH TIME ZONE,
  
  -- Step completion timestamps
  site_entered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  address_entered_at TIMESTAMP WITH TIME ZONE,
  analysis_completed_at TIMESTAMP WITH TIME ZONE,
  services_viewed_at TIMESTAMP WITH TIME ZONE,
  options_selected_at TIMESTAMP WITH TIME ZONE,
  extra_data_filled_at TIMESTAMP WITH TIME ZONE,
  auth_completed_at TIMESTAMP WITH TIME ZONE,
  dashboard_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Journey data
  property_address TEXT,
  property_coordinates JSONB,
  analysis_results JSONB,
  total_monthly_revenue NUMERIC DEFAULT 0,
  total_opportunities INTEGER DEFAULT 0,
  
  -- User selections
  selected_services JSONB DEFAULT '[]'::jsonb,
  interested_services JSONB DEFAULT '[]'::jsonb,
  selected_option TEXT, -- 'manual' or 'concierge'
  extra_form_data JSONB DEFAULT '{}'::jsonb,
  
  -- Analytics data
  referrer TEXT,
  landing_page TEXT,
  user_agent TEXT,
  ip_address INET,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Status tracking
  is_conversion BOOLEAN DEFAULT false,
  conversion_type TEXT,
  drop_off_step TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique sessions
  UNIQUE(session_id)
);

-- Create journey analytics summary table
CREATE TABLE public.journey_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Traffic metrics
  total_visitors INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,
  
  -- Conversion funnel
  addresses_entered INTEGER DEFAULT 0,
  analyses_completed INTEGER DEFAULT 0,
  services_viewed INTEGER DEFAULT 0,
  options_selected INTEGER DEFAULT 0,
  auths_completed INTEGER DEFAULT 0,
  dashboards_accessed INTEGER DEFAULT 0,
  
  -- Conversion rates (percentages)
  address_conversion_rate NUMERIC DEFAULT 0,
  analysis_conversion_rate NUMERIC DEFAULT 0,
  service_view_rate NUMERIC DEFAULT 0,
  option_selection_rate NUMERIC DEFAULT 0,
  auth_conversion_rate NUMERIC DEFAULT 0,
  dashboard_conversion_rate NUMERIC DEFAULT 0,
  
  -- Service preferences
  popular_services JSONB DEFAULT '[]'::jsonb,
  manual_vs_concierge JSONB DEFAULT '{"manual": 0, "concierge": 0}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(date)
);

-- Add RLS policies
ALTER TABLE public.user_journey_complete ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_analytics ENABLE ROW LEVEL SECURITY;

-- Journey complete policies - users can only see their own journey
CREATE POLICY "Users can view their own journey data" 
  ON public.user_journey_complete 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert journey data" 
  ON public.user_journey_complete 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own journey data" 
  ON public.user_journey_complete 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Analytics policies - public read access for admin dashboard
CREATE POLICY "Public read access to analytics" 
  ON public.journey_analytics 
  FOR SELECT 
  USING (true);

CREATE POLICY "Service role can manage analytics" 
  ON public.journey_analytics 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create functions for journey tracking
CREATE OR REPLACE FUNCTION public.update_journey_step(
  p_session_id TEXT,
  p_step TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  journey_id UUID;
  step_timestamp_col TEXT;
BEGIN
  -- Determine the timestamp column name based on step
  step_timestamp_col := CASE p_step
    WHEN 'address_entered' THEN 'address_entered_at'
    WHEN 'analysis_completed' THEN 'analysis_completed_at'
    WHEN 'services_viewed' THEN 'services_viewed_at'
    WHEN 'options_selected' THEN 'options_selected_at'
    WHEN 'extra_data_filled' THEN 'extra_data_filled_at'
    WHEN 'auth_completed' THEN 'auth_completed_at'
    WHEN 'dashboard_accessed' THEN 'dashboard_accessed_at'
    ELSE NULL
  END;

  -- Insert or update journey record
  INSERT INTO public.user_journey_complete (
    session_id,
    current_step,
    property_address,
    property_coordinates,
    analysis_results,
    total_monthly_revenue,
    total_opportunities,
    selected_services,
    interested_services,
    selected_option,
    extra_form_data
  ) VALUES (
    p_session_id,
    p_step,
    COALESCE(p_data->>'property_address', ''),
    p_data->'property_coordinates',
    p_data->'analysis_results',
    COALESCE((p_data->>'total_monthly_revenue')::numeric, 0),
    COALESCE((p_data->>'total_opportunities')::integer, 0),
    COALESCE(p_data->'selected_services', '[]'::jsonb),
    COALESCE(p_data->'interested_services', '[]'::jsonb),
    p_data->>'selected_option',
    COALESCE(p_data->'extra_form_data', '{}'::jsonb)
  )
  ON CONFLICT (session_id) DO UPDATE SET
    current_step = p_step,
    property_address = COALESCE(EXCLUDED.property_address, user_journey_complete.property_address),
    property_coordinates = COALESCE(EXCLUDED.property_coordinates, user_journey_complete.property_coordinates),
    analysis_results = COALESCE(EXCLUDED.analysis_results, user_journey_complete.analysis_results),
    total_monthly_revenue = COALESCE(EXCLUDED.total_monthly_revenue, user_journey_complete.total_monthly_revenue),
    total_opportunities = COALESCE(EXCLUDED.total_opportunities, user_journey_complete.total_opportunities),
    selected_services = COALESCE(EXCLUDED.selected_services, user_journey_complete.selected_services),
    interested_services = COALESCE(EXCLUDED.interested_services, user_journey_complete.interested_services),
    selected_option = COALESCE(EXCLUDED.selected_option, user_journey_complete.selected_option),
    extra_form_data = COALESCE(EXCLUDED.extra_form_data, user_journey_complete.extra_form_data),
    updated_at = now()
  RETURNING id INTO journey_id;

  -- Update the specific timestamp column
  IF step_timestamp_col IS NOT NULL THEN
    EXECUTE format('UPDATE public.user_journey_complete SET %I = now() WHERE id = $1', step_timestamp_col) USING journey_id;
  END IF;

  RETURN journey_id;
END;
$$;

-- Function to link journey data to authenticated user
CREATE OR REPLACE FUNCTION public.link_journey_to_user(
  p_session_id TEXT,
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_journey_complete 
  SET 
    user_id = p_user_id,
    auth_completed_at = now(),
    updated_at = now()
  WHERE session_id = p_session_id;
END;
$$;

-- Function to get user's complete journey data for dashboard
CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(p_user_id UUID)
RETURNS TABLE (
  journey_id UUID,
  property_address TEXT,
  analysis_results JSONB,
  total_monthly_revenue NUMERIC,
  total_opportunities INTEGER,
  selected_services JSONB,
  selected_option TEXT,
  journey_progress JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ujc.id,
    ujc.property_address,
    ujc.analysis_results,
    ujc.total_monthly_revenue,
    ujc.total_opportunities,
    ujc.selected_services,
    ujc.selected_option,
    jsonb_build_object(
      'steps_completed', array_remove(ARRAY[
        CASE WHEN ujc.address_entered_at IS NOT NULL THEN 'address_entered' END,
        CASE WHEN ujc.analysis_completed_at IS NOT NULL THEN 'analysis_completed' END,
        CASE WHEN ujc.services_viewed_at IS NOT NULL THEN 'services_viewed' END,
        CASE WHEN ujc.options_selected_at IS NOT NULL THEN 'options_selected' END,
        CASE WHEN ujc.auth_completed_at IS NOT NULL THEN 'auth_completed' END,
        CASE WHEN ujc.dashboard_accessed_at IS NOT NULL THEN 'dashboard_accessed' END
      ], NULL),
      'current_step', ujc.current_step,
      'journey_start', ujc.journey_start_at,
      'last_activity', ujc.updated_at
    )
  FROM public.user_journey_complete ujc
  WHERE ujc.user_id = p_user_id
  ORDER BY ujc.updated_at DESC
  LIMIT 1;
END;
$$;

-- Create update trigger for journey complete table
CREATE OR REPLACE FUNCTION update_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_journey_complete_updated_at
    BEFORE UPDATE ON public.user_journey_complete
    FOR EACH ROW
    EXECUTE FUNCTION update_journey_updated_at();
