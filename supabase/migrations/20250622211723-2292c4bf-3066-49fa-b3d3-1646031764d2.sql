
-- Create affiliate earnings table to track user earnings from various services
CREATE TABLE public.affiliate_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  service TEXT NOT NULL,
  earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_sync_status TEXT NOT NULL DEFAULT 'pending',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service)
);

-- Create service providers table (standardized)
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  affiliate_program_url TEXT,
  referral_link_template TEXT,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  setup_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  avg_monthly_earnings_low DECIMAL(10,2) NOT NULL DEFAULT 0,
  avg_monthly_earnings_high DECIMAL(10,2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate registrations table to track user registrations with affiliate programs
CREATE TABLE public.affiliate_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  bundle_selection_id UUID,
  provider_id UUID REFERENCES public.service_providers(id) NOT NULL,
  affiliate_link TEXT,
  tracking_code TEXT,
  registration_status TEXT NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'completed', 'failed')),
  registration_date TIMESTAMP WITH TIME ZONE,
  first_commission_date TIMESTAMP WITH TIME ZONE,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate credentials table for encrypted storage of service credentials
CREATE TABLE public.affiliate_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  service TEXT NOT NULL,
  encrypted_email TEXT,
  encrypted_password TEXT,
  encryption_key_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service)
);

-- Create bundle configurations table
CREATE TABLE public.bundle_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  asset_requirements JSONB NOT NULL DEFAULT '[]',
  min_assets INTEGER NOT NULL DEFAULT 1,
  max_providers_per_asset INTEGER NOT NULL DEFAULT 1,
  total_setup_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_monthly_earnings_low DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_monthly_earnings_high DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_earnings
CREATE POLICY "Users can view their own earnings" 
  ON public.affiliate_earnings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own earnings" 
  ON public.affiliate_earnings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own earnings" 
  ON public.affiliate_earnings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for service_providers (public read access)
CREATE POLICY "Anyone can view active service providers" 
  ON public.service_providers 
  FOR SELECT 
  USING (is_active = true);

-- RLS Policies for affiliate_registrations
CREATE POLICY "Users can view their own registrations" 
  ON public.affiliate_registrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registrations" 
  ON public.affiliate_registrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" 
  ON public.affiliate_registrations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for affiliate_credentials
CREATE POLICY "Users can view their own credentials" 
  ON public.affiliate_credentials 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials" 
  ON public.affiliate_credentials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials" 
  ON public.affiliate_credentials 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials" 
  ON public.affiliate_credentials 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for bundle_configurations (public read access)
CREATE POLICY "Anyone can view active bundle configurations" 
  ON public.bundle_configurations 
  FOR SELECT 
  USING (is_active = true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_affiliate_earnings_updated_at BEFORE UPDATE ON public.affiliate_earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliate_registrations_updated_at BEFORE UPDATE ON public.affiliate_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliate_credentials_updated_at BEFORE UPDATE ON public.affiliate_credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bundle_configurations_updated_at BEFORE UPDATE ON public.bundle_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample service providers
INSERT INTO public.service_providers (name, category, description, commission_rate, setup_cost, avg_monthly_earnings_low, avg_monthly_earnings_high, conversion_rate, priority) VALUES
('FlexOffers', 'affiliate', 'Performance marketing platform', 0.05, 0, 25, 150, 0.025, 1),
('Honeygain', 'passive', 'Passive income through internet sharing', 0.10, 0, 10, 50, 0.15, 2),
('Tesla Energy', 'solar', 'Solar panel and energy storage solutions', 0.03, 15000, 200, 500, 0.08, 3),
('Swimply', 'pool', 'Pool rental marketplace', 0.15, 0, 100, 300, 0.12, 4),
('Airbnb', 'rental', 'Home rental marketplace', 0.03, 0, 150, 800, 0.18, 5);

-- Insert some sample bundle configurations
INSERT INTO public.bundle_configurations (name, description, asset_requirements, min_assets, total_setup_cost, total_monthly_earnings_low, total_monthly_earnings_high) VALUES
('Solar & Storage Bundle', 'Maximize your renewable energy earnings', '["solar", "storage"]', 2, 15000, 200, 500),
('Smart Home Bundle', 'Complete smart home monetization', '["wifi", "ev_charger"]', 2, 5000, 100, 300),
('Rental Property Bundle', 'Maximize rental income streams', '["pool", "parking", "garden"]', 2, 1000, 250, 600);
