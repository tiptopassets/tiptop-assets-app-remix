
-- Drop unused/complex tables that aren't needed for the core flow
DROP TABLE IF EXISTS affiliate_credentials CASCADE;
DROP TABLE IF EXISTS affiliate_earnings CASCADE;
DROP TABLE IF EXISTS affiliate_registrations CASCADE;
DROP TABLE IF EXISTS bundle_analytics CASCADE;
DROP TABLE IF EXISTS bundle_configurations CASCADE;
DROP TABLE IF EXISTS enhanced_property_analyses CASCADE;
DROP TABLE IF EXISTS enhanced_service_providers CASCADE;
DROP TABLE IF EXISTS onboarding_messages CASCADE;
DROP TABLE IF EXISTS partner_earnings_sync CASCADE;
DROP TABLE IF EXISTS partner_integration_progress CASCADE;
DROP TABLE IF EXISTS partner_recommendations CASCADE;
DROP TABLE IF EXISTS property_analyses CASCADE;
DROP TABLE IF EXISTS property_submissions CASCADE;
DROP TABLE IF EXISTS provider_setup_requirements CASCADE;
DROP TABLE IF EXISTS provider_supported_assets CASCADE;
DROP TABLE IF EXISTS service_integrations CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS user_affiliate_journeys CASCADE;
DROP TABLE IF EXISTS user_bundle_selections CASCADE;
DROP TABLE IF EXISTS user_onboarding CASCADE;

-- Create visitor_sessions table for analytics tracking
CREATE TABLE public.visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT,
  current_step TEXT DEFAULT 'address_entry',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  conversion_type TEXT, -- 'manual', 'concierge', 'abandoned'
  total_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_journey_progress for tracking user flow state
CREATE TABLE public.user_journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES public.visitor_sessions(session_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address_entered BOOLEAN DEFAULT false,
  address_data JSONB,
  analysis_completed BOOLEAN DEFAULT false,
  analysis_id UUID REFERENCES public.user_property_analyses(id) ON DELETE SET NULL,
  services_viewed BOOLEAN DEFAULT false,
  extra_data_filled BOOLEAN DEFAULT false,
  extra_data JSONB DEFAULT '{}',
  option_selected TEXT, -- 'manual', 'concierge'
  auth_completed BOOLEAN DEFAULT false,
  dashboard_accessed BOOLEAN DEFAULT false,
  current_step TEXT DEFAULT 'address_entry',
  step_completed_at JSONB DEFAULT '{}', -- stores timestamps for each step
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create available_services for property-specific opportunities
CREATE TABLE public.available_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.user_property_analyses(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'rooftop', 'parking', 'garden', 'storage', 'bandwidth', 'rental'
  service_name TEXT NOT NULL,
  monthly_revenue_low NUMERIC DEFAULT 0,
  monthly_revenue_high NUMERIC DEFAULT 0,
  setup_cost NUMERIC DEFAULT 0,
  roi_months INTEGER,
  requirements JSONB DEFAULT '{}',
  provider_info JSONB DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  priority_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_service_selections for tracking user choices
CREATE TABLE public.user_service_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.user_journey_progress(id) ON DELETE SET NULL,
  available_service_id UUID REFERENCES public.available_services(id) ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  selection_type TEXT DEFAULT 'interested', -- 'selected', 'interested', 'maybe_later'
  notes TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update service_providers table to be simpler and focused
ALTER TABLE public.service_providers DROP COLUMN IF EXISTS affiliate_program_url;
ALTER TABLE public.service_providers DROP COLUMN IF EXISTS referral_link_template;
ALTER TABLE public.service_providers DROP COLUMN IF EXISTS conversion_rate;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}';
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS service_areas JSONB DEFAULT '[]';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_user_id ON public.visitor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_progress_session_id ON public.user_journey_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_journey_progress_user_id ON public.user_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_available_services_analysis_id ON public.available_services(analysis_id);
CREATE INDEX IF NOT EXISTS idx_user_service_selections_user_id ON public.user_service_selections(user_id);

-- Enable RLS on new tables
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_selections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_sessions (allow anonymous access for analytics)
CREATE POLICY "Anyone can insert visitor sessions" ON public.visitor_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own sessions" ON public.visitor_sessions
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions" ON public.visitor_sessions
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

-- RLS Policies for user_journey_progress
CREATE POLICY "Users can view their own journey progress" ON public.user_journey_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own journey progress" ON public.user_journey_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own journey progress" ON public.user_journey_progress
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for available_services (readable by analysis owner)
CREATE POLICY "Users can view services for their analyses" ON public.available_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_property_analyses 
      WHERE id = analysis_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for user_service_selections
CREATE POLICY "Users can manage their own service selections" ON public.user_service_selections
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visitor_sessions_updated_at 
  BEFORE UPDATE ON public.visitor_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_journey_progress_updated_at 
  BEFORE UPDATE ON public.user_journey_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
