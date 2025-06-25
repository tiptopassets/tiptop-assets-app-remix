
-- Create bundle_configurations table
CREATE TABLE public.bundle_configurations (
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

-- Fix affiliate_credentials table to match TypeScript expectations
ALTER TABLE public.affiliate_credentials 
  ADD COLUMN IF NOT EXISTS encrypted_email TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_password TEXT,
  ADD COLUMN IF NOT EXISTS service TEXT;

-- Update affiliate_credentials to use 'service' instead of 'provider_name' for consistency
UPDATE public.affiliate_credentials SET service = provider_name WHERE service IS NULL;

-- Add missing fields to service_providers table with proper numeric constraints
ALTER TABLE public.service_providers 
  ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC(4,2) DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS referral_link_template TEXT,
  ADD COLUMN IF NOT EXISTS affiliate_program_url TEXT;

-- Fix affiliate_earnings table structure to match AffiliateEarning interface
DO $$
BEGIN
  -- Only rename if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_earnings' AND column_name = 'provider_name') THEN
    ALTER TABLE public.affiliate_earnings RENAME COLUMN provider_name TO service;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_earnings' AND column_name = 'earnings_amount') THEN
    ALTER TABLE public.affiliate_earnings RENAME COLUMN earnings_amount TO earnings;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_earnings' AND column_name = 'status') THEN
    ALTER TABLE public.affiliate_earnings RENAME COLUMN status TO last_sync_status;
  END IF;
END $$;

-- Add RLS policies for bundle_configurations
ALTER TABLE public.bundle_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to bundle configurations" 
  ON public.bundle_configurations 
  FOR SELECT 
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bundle_configurations_active ON public.bundle_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON public.service_providers(category);

-- Insert sample bundle configurations with smaller numeric values
INSERT INTO public.bundle_configurations (name, description, asset_requirements, min_assets, max_providers_per_asset, total_setup_cost, total_monthly_earnings_low, total_monthly_earnings_high) VALUES
('Solar + EV Bundle', 'Maximize your property with solar panels and EV charging', ARRAY['Solar Panel', 'EV Charger'], 2, 2, 500, 200, 800),
('Complete Property Bundle', 'Full monetization package for all property assets', ARRAY['Solar Panel', 'EV Charger', 'Swimming Pool', 'Parking Space'], 3, 3, 1200, 500, 2000),
('Sharing Economy Bundle', 'Share your spaces and earn passive income', ARRAY['Swimming Pool', 'Parking Space', 'Garden'], 2, 2, 100, 150, 600);

-- Insert sample service providers with proper numeric constraints
INSERT INTO public.service_providers (name, category, description, commission_rate, setup_cost, avg_monthly_earnings_low, avg_monthly_earnings_high, conversion_rate, priority, is_active) VALUES
('Tesla Energy', 'Solar Panel', 'Tesla solar panel installation and energy services', 5.0, 200, 100, 400, 3.2, 10, true),
('ChargePoint', 'EV Charger', 'EV charging station installation and management', 4.5, 150, 80, 300, 2.8, 9, true),
('Swimply', 'Swimming Pool', 'Pool sharing platform for homeowners', 15.0, 0, 200, 800, 4.1, 8, true),
('SpotHero', 'Parking Space', 'Parking space rental marketplace', 12.0, 0, 50, 200, 2.1, 7, true)
ON CONFLICT (name) DO NOTHING;
