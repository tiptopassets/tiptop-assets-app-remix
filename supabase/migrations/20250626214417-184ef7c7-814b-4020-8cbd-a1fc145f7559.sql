
-- Add missing columns to partner_integration_progress table
ALTER TABLE public.partner_integration_progress 
ADD COLUMN IF NOT EXISTS registration_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS earnings_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS next_steps TEXT[] DEFAULT '{}';

-- Update the user_onboarding table to include the onboarding_data column that the code expects
ALTER TABLE public.user_onboarding 
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}'::jsonb;

-- Create the enhanced_service_providers table with all expected columns
CREATE TABLE IF NOT EXISTS public.enhanced_service_providers (
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
  avg_earnings_low NUMERIC DEFAULT 0,
  avg_earnings_high NUMERIC DEFAULT 0,
  priority_score INTEGER DEFAULT 0,
  avg_monthly_earnings_low NUMERIC DEFAULT 0,
  avg_monthly_earnings_high NUMERIC DEFAULT 0,
  affiliate_base_url TEXT,
  integration_status TEXT DEFAULT 'active',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create provider_supported_assets table
CREATE TABLE IF NOT EXISTS public.provider_supported_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  asset_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create provider_setup_requirements table
CREATE TABLE IF NOT EXISTS public.provider_setup_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  requirement_key TEXT NOT NULL,
  requirement_value TEXT NOT NULL,
  requirement_type TEXT DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for new tables
ALTER TABLE public.enhanced_service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_supported_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_setup_requirements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access for service provider data)
CREATE POLICY "Public read access to enhanced service providers" 
  ON public.enhanced_service_providers FOR SELECT 
  USING (true);

CREATE POLICY "Public read access to provider supported assets" 
  ON public.provider_supported_assets FOR SELECT 
  USING (true);

CREATE POLICY "Public read access to provider setup requirements" 
  ON public.provider_setup_requirements FOR SELECT 
  USING (true);

-- Add foreign key constraints
ALTER TABLE public.provider_supported_assets 
ADD CONSTRAINT fk_provider_supported_assets_provider_id 
FOREIGN KEY (provider_id) REFERENCES public.enhanced_service_providers(id) ON DELETE CASCADE;

ALTER TABLE public.provider_setup_requirements 
ADD CONSTRAINT fk_provider_setup_requirements_provider_id 
FOREIGN KEY (provider_id) REFERENCES public.enhanced_service_providers(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_supported_assets_provider_id ON public.provider_supported_assets(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_setup_requirements_provider_id ON public.provider_setup_requirements(provider_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_service_providers_active ON public.enhanced_service_providers(is_active);
