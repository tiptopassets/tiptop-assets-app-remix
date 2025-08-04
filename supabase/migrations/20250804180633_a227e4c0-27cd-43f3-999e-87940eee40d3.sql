-- Create user_roles table with enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'moderator');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create bundle_configurations table
CREATE TABLE IF NOT EXISTS public.bundle_configurations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  asset_requirements text[] DEFAULT '{}',
  min_assets integer DEFAULT 1,
  max_providers_per_asset integer DEFAULT 3,
  total_setup_cost numeric DEFAULT 0,
  total_monthly_earnings_low numeric DEFAULT 0,
  total_monthly_earnings_high numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create service_providers table (the code expects this name, not enhanced_service_providers)
CREATE TABLE IF NOT EXISTS public.service_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text,
  description text,
  logo_url text,
  website_url text,
  affiliate_program_url text,
  referral_link_template text,
  commission_rate numeric DEFAULT 0,
  setup_cost numeric DEFAULT 0,
  avg_monthly_earnings_low numeric DEFAULT 0,
  avg_monthly_earnings_high numeric DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add missing columns to existing tables
ALTER TABLE affiliate_registrations ADD COLUMN IF NOT EXISTS provider_id text;
ALTER TABLE affiliate_registrations ADD COLUMN IF NOT EXISTS bundle_selection_id uuid;

ALTER TABLE user_bundle_selections ADD COLUMN IF NOT EXISTS property_address text;

-- Create flexoffers_user_mapping table (needed for webhook)
CREATE TABLE IF NOT EXISTS public.flexoffers_user_mapping (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  sub_affiliate_id text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create flexoffers_transactions table (needed for webhook)
CREATE TABLE IF NOT EXISTS public.flexoffers_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  transaction_id text NOT NULL UNIQUE,
  program_name text NOT NULL,
  commission numeric NOT NULL,
  status text NOT NULL,
  transaction_date timestamp with time zone NOT NULL,
  click_date timestamp with time zone,
  payload jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flexoffers_user_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flexoffers_transactions ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for bundle_configurations (public read)
CREATE POLICY "Public read access for active bundles" 
ON public.bundle_configurations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all bundles" 
ON public.bundle_configurations 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for service_providers (public read)
CREATE POLICY "Public read access for active service providers" 
ON public.service_providers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all service providers" 
ON public.service_providers 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for flexoffers tables
CREATE POLICY "Users can view their own flexoffers mapping" 
ON public.flexoffers_user_mapping 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flexoffers mapping" 
ON public.flexoffers_user_mapping 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own flexoffers transactions" 
ON public.flexoffers_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bundle_configurations_updated_at
  BEFORE UPDATE ON public.bundle_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flexoffers_user_mapping_updated_at
  BEFORE UPDATE ON public.flexoffers_user_mapping
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flexoffers_transactions_updated_at
  BEFORE UPDATE ON public.flexoffers_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();