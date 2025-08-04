-- Create user login stats table
CREATE TABLE public.user_login_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  login_count INTEGER DEFAULT 1,
  first_login_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user addresses table
CREATE TABLE public.user_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT,
  formatted_address TEXT,
  latitude REAL,
  longitude REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user property analyses table
CREATE TABLE public.user_property_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address_id UUID REFERENCES public.user_addresses(id),
  property_type TEXT,
  total_monthly_revenue NUMERIC DEFAULT 0,
  total_opportunities INTEGER DEFAULT 0,
  analysis_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user journey complete table
CREATE TABLE public.user_journey_complete (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_id UUID,
  property_address TEXT,
  total_monthly_revenue NUMERIC DEFAULT 0,
  total_opportunities INTEGER DEFAULT 0,
  analysis_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create affiliate earnings table
CREATE TABLE public.affiliate_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  earnings_amount NUMERIC DEFAULT 0,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create service integrations table
CREATE TABLE public.service_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  provider TEXT,
  is_active BOOLEAN DEFAULT true,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_login_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_property_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_complete ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific data
CREATE POLICY "Users can view their own login stats" ON public.user_login_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own login stats" ON public.user_login_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own login stats" ON public.user_login_stats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own addresses" ON public.user_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addresses" ON public.user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON public.user_addresses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own property analyses" ON public.user_property_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own property analyses" ON public.user_property_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own property analyses" ON public.user_property_analyses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own journey data" ON public.user_journey_complete FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journey data" ON public.user_journey_complete FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journey data" ON public.user_journey_complete FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own affiliate earnings" ON public.affiliate_earnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own affiliate earnings" ON public.affiliate_earnings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin-only access for service integrations
CREATE POLICY "Only admins can manage service integrations" ON public.service_integrations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@tiptop.com'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_login_stats_updated_at
  BEFORE UPDATE ON public.user_login_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_property_analyses_updated_at
  BEFORE UPDATE ON public.user_property_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_journey_complete_updated_at
  BEFORE UPDATE ON public.user_journey_complete
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_earnings_updated_at
  BEFORE UPDATE ON public.affiliate_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_integrations_updated_at
  BEFORE UPDATE ON public.service_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();