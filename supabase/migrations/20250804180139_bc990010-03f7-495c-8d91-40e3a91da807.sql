-- Add missing column to user_login_stats table
ALTER TABLE user_login_stats ADD COLUMN IF NOT EXISTS last_ip text;

-- Create affiliate_registrations table
CREATE TABLE IF NOT EXISTS public.affiliate_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  provider_name text NOT NULL,
  registration_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user_bundle_selections table
CREATE TABLE IF NOT EXISTS public.user_bundle_selections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  bundle_name text NOT NULL,
  bundle_data jsonb DEFAULT '{}'::jsonb,
  selected_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create affiliate_credentials table
CREATE TABLE IF NOT EXISTS public.affiliate_credentials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  provider_name text NOT NULL,
  credentials jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text,
  is_active boolean DEFAULT true,
  configuration jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add missing columns to affiliate_earnings table
ALTER TABLE affiliate_earnings ADD COLUMN IF NOT EXISTS provider_name text;
ALTER TABLE affiliate_earnings ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Enable RLS on all new tables
ALTER TABLE public.affiliate_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bundle_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for affiliate_registrations
CREATE POLICY "Users can view their own affiliate registrations" 
ON public.affiliate_registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affiliate registrations" 
ON public.affiliate_registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate registrations" 
ON public.affiliate_registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_bundle_selections
CREATE POLICY "Users can view their own bundle selections" 
ON public.user_bundle_selections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bundle selections" 
ON public.user_bundle_selections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bundle selections" 
ON public.user_bundle_selections 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for affiliate_credentials
CREATE POLICY "Users can view their own affiliate credentials" 
ON public.affiliate_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affiliate credentials" 
ON public.affiliate_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate credentials" 
ON public.affiliate_credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for services (public read access)
CREATE POLICY "Public read access for active services" 
ON public.services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all services" 
ON public.services 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE users.id = auth.uid() 
  AND users.email = 'admin@tiptop.com'
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_affiliate_registrations_updated_at
  BEFORE UPDATE ON public.affiliate_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_bundle_selections_updated_at
  BEFORE UPDATE ON public.user_bundle_selections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_credentials_updated_at
  BEFORE UPDATE ON public.affiliate_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();