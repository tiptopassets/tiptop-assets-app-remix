
-- Create enhanced_service_providers table
CREATE TABLE public.enhanced_service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  url TEXT,
  login_url TEXT,
  asset_types TEXT[] DEFAULT '{}',
  connected BOOLEAN DEFAULT false,
  setup_instructions TEXT,
  referral_link_template TEXT,
  supported_assets JSONB DEFAULT '[]'::jsonb,
  setup_requirements JSONB DEFAULT '{}'::jsonb,
  commission_rate NUMERIC DEFAULT 0,
  avg_monthly_earnings_low NUMERIC DEFAULT 0,
  avg_monthly_earnings_high NUMERIC DEFAULT 0,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_bundle_selections table
CREATE TABLE public.user_bundle_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  bundle_id UUID,
  property_address TEXT,
  selected_assets TEXT[] DEFAULT '{}',
  selected_providers TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create affiliate_registrations table
CREATE TABLE public.affiliate_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  bundle_selection_id UUID REFERENCES public.user_bundle_selections(id),
  provider_id UUID REFERENCES public.enhanced_service_providers(id),
  affiliate_link TEXT,
  tracking_code TEXT,
  registration_status TEXT DEFAULT 'pending',
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  first_commission_date TIMESTAMP WITH TIME ZONE,
  total_earnings NUMERIC DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create provider_supported_assets table (normalized)
CREATE TABLE public.provider_supported_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.enhanced_service_providers(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provider_setup_requirements table (normalized)
CREATE TABLE public.provider_setup_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.enhanced_service_providers(id) ON DELETE CASCADE,
  requirement_key TEXT NOT NULL,
  requirement_value TEXT NOT NULL,
  requirement_type TEXT DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.enhanced_service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bundle_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_supported_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_setup_requirements ENABLE ROW LEVEL SECURITY;

-- Policies for enhanced_service_providers (public read)
CREATE POLICY "Public read access to enhanced providers" 
  ON public.enhanced_service_providers 
  FOR SELECT 
  USING (true);

-- Policies for user_bundle_selections
CREATE POLICY "Users can view their own bundle selections" 
  ON public.user_bundle_selections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bundle selections" 
  ON public.user_bundle_selections 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Policies for affiliate_registrations
CREATE POLICY "Users can view their own affiliate registrations" 
  ON public.affiliate_registrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own affiliate registrations" 
  ON public.affiliate_registrations 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Policies for provider tables (public read)
CREATE POLICY "Public read access to provider assets" 
  ON public.provider_supported_assets 
  FOR SELECT 
  USING (true);

CREATE POLICY "Public read access to provider requirements" 
  ON public.provider_setup_requirements 
  FOR SELECT 
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_enhanced_providers_active ON public.enhanced_service_providers(is_active);
CREATE INDEX idx_affiliate_registrations_user_id ON public.affiliate_registrations(user_id);
CREATE INDEX idx_bundle_selections_user_id ON public.user_bundle_selections(user_id);
CREATE INDEX idx_provider_assets_provider_id ON public.provider_supported_assets(provider_id);
CREATE INDEX idx_provider_requirements_provider_id ON public.provider_setup_requirements(provider_id);
