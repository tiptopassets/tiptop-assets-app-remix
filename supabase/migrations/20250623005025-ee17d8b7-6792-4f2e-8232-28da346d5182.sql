
-- Create missing tables to match the previous schema

-- 1. Basic services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enhanced property analyses table
CREATE TABLE public.enhanced_property_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_address TEXT NOT NULL,
  coordinates JSONB,
  satellite_image_url TEXT,
  street_view_image_url TEXT,
  google_solar_data JSONB,
  gpt_analysis_raw JSONB,
  final_analysis_results JSONB,
  accuracy_score NUMERIC DEFAULT 0.00,
  data_sources_used JSONB DEFAULT '[]'::jsonb,
  analysis_version TEXT DEFAULT 'v2.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Property submissions table
CREATE TABLE public.property_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_address TEXT NOT NULL,
  submission_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Service integrations table
CREATE TABLE public.service_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  integration_status TEXT DEFAULT 'pending',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. User bundle selections table
CREATE TABLE public.user_bundle_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bundle_id UUID NOT NULL,
  selection_status TEXT DEFAULT 'selected',
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Partner earnings sync table
CREATE TABLE public.partner_earnings_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  partner_name TEXT NOT NULL,
  sync_status TEXT DEFAULT 'pending',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  earnings_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Bundle analytics table
CREATE TABLE public.bundle_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL,
  user_id UUID,
  analytics_data JSONB NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. User affiliate journeys table
CREATE TABLE public.user_affiliate_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_data JSONB NOT NULL,
  current_step TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Solar API cache table
CREATE TABLE public.solar_api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_address TEXT NOT NULL,
  coordinates JSONB,
  solar_data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all new tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_property_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bundle_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_earnings_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_affiliate_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_api_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific tables
CREATE POLICY "Users can view their own enhanced property analyses" 
  ON public.enhanced_property_analyses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enhanced property analyses" 
  ON public.enhanced_property_analyses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enhanced property analyses" 
  ON public.enhanced_property_analyses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enhanced property analyses" 
  ON public.enhanced_property_analyses FOR DELETE 
  USING (auth.uid() = user_id);

-- Similar policies for other user-specific tables
CREATE POLICY "Users can view their own property submissions" 
  ON public.property_submissions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property submissions" 
  ON public.property_submissions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own service integrations" 
  ON public.service_integrations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service integrations" 
  ON public.service_integrations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bundle selections" 
  ON public.user_bundle_selections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bundle selections" 
  ON public.user_bundle_selections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own partner earnings sync" 
  ON public.partner_earnings_sync FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own partner earnings sync" 
  ON public.partner_earnings_sync FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own affiliate journeys" 
  ON public.user_affiliate_journeys FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affiliate journeys" 
  ON public.user_affiliate_journeys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Public access policies for shared tables
CREATE POLICY "Anyone can view active services" 
  ON public.services FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Anyone can view solar api cache" 
  ON public.solar_api_cache FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert solar api cache" 
  ON public.solar_api_cache FOR INSERT 
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_status ON public.services(status);
CREATE INDEX idx_enhanced_property_analyses_user_id ON public.enhanced_property_analyses(user_id);
CREATE INDEX idx_property_submissions_user_id ON public.property_submissions(user_id);
CREATE INDEX idx_service_integrations_user_id ON public.service_integrations(user_id);
CREATE INDEX idx_user_bundle_selections_user_id ON public.user_bundle_selections(user_id);
CREATE INDEX idx_partner_earnings_sync_user_id ON public.partner_earnings_sync(user_id);
CREATE INDEX idx_bundle_analytics_bundle_id ON public.bundle_analytics(bundle_id);
CREATE INDEX idx_user_affiliate_journeys_user_id ON public.user_affiliate_journeys(user_id);
CREATE INDEX idx_solar_api_cache_property_address ON public.solar_api_cache(property_address);
CREATE INDEX idx_solar_api_cache_expires_at ON public.solar_api_cache(expires_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_services_updated_at 
  BEFORE UPDATE ON public.services 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_property_analyses_updated_at 
  BEFORE UPDATE ON public.enhanced_property_analyses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_submissions_updated_at 
  BEFORE UPDATE ON public.property_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_integrations_updated_at 
  BEFORE UPDATE ON public.service_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_bundle_selections_updated_at 
  BEFORE UPDATE ON public.user_bundle_selections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_earnings_sync_updated_at 
  BEFORE UPDATE ON public.partner_earnings_sync 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bundle_analytics_updated_at 
  BEFORE UPDATE ON public.bundle_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_affiliate_journeys_updated_at 
  BEFORE UPDATE ON public.user_affiliate_journeys 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some basic service data to match what the code expects
INSERT INTO public.services (name, category, description, status) VALUES
('Solar Panels', 'energy', 'Solar energy installation services', 'active'),
('EV Charging', 'automotive', 'Electric vehicle charging stations', 'active'),
('Internet Sharing', 'connectivity', 'Internet bandwidth sharing services', 'active'),
('Storage Rental', 'storage', 'Property storage rental services', 'active');
