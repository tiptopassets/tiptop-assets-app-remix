
-- Create missing tables to fix TypeScript errors

-- Create affiliate_earnings table
CREATE TABLE public.affiliate_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  provider_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  earnings_amount NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create affiliate_credentials table
CREATE TABLE public.affiliate_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  provider_name TEXT NOT NULL,
  api_key TEXT,
  secret_key TEXT,
  account_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider_name)
);

-- Create services table (referenced by some components)
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0,
  provider_info JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for these tables
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policies for affiliate_earnings
CREATE POLICY "Users can view their own earnings" 
  ON public.affiliate_earnings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own earnings" 
  ON public.affiliate_earnings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policies for affiliate_credentials
CREATE POLICY "Users can view their own credentials" 
  ON public.affiliate_credentials 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own credentials" 
  ON public.affiliate_credentials 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Policies for services
CREATE POLICY "Public read access to services" 
  ON public.services 
  FOR SELECT 
  USING (true);

CREATE POLICY "Service role can manage services" 
  ON public.services 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');
