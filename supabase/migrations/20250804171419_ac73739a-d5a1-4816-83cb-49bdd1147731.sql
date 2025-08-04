-- Create enhanced service providers table
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
  supported_assets TEXT[] DEFAULT '{}',
  setup_requirements JSONB DEFAULT '{}',
  commission_rate NUMERIC DEFAULT 0,
  avg_monthly_earnings_low NUMERIC DEFAULT 0,
  avg_monthly_earnings_high NUMERIC DEFAULT 0,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enhanced_service_providers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for active providers
CREATE POLICY "Public read access for active providers" ON public.enhanced_service_providers
FOR SELECT USING (is_active = true);

-- Create policy for admin management
CREATE POLICY "Admins can manage all providers" ON public.enhanced_service_providers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@tiptop.com'
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_enhanced_service_providers_updated_at
  BEFORE UPDATE ON public.enhanced_service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample service providers
INSERT INTO public.enhanced_service_providers (name, description, logo, url, login_url, asset_types, setup_instructions, referral_link_template, avg_monthly_earnings_low, avg_monthly_earnings_high, priority, is_active) VALUES
('Airbnb Unit Rental', 'Rent out your property or spare rooms to travelers on Airbnb', 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com', 'https://www.airbnb.com/login', ARRAY['short_term_rental','rental','room_rental','guest_room','property'], 'Create a host profile, upload property photos, set pricing and availability, complete verification.', 'https://www.airbnb.com/host/homes', 800, 3000, 10, true),
('Swimply', 'Rent your pool by the hour to guests looking for a private swimming experience', 'https://swimply.com/favicon.ico', 'https://swimply.com', 'https://swimply.com/login', ARRAY['pool','swimming_pool','hot_tub'], 'Complete Swimply host verification with comprehensive pool photos, safety equipment documentation, and insurance verification.', 'https://swimply.com/host', 150, 800, 10, true),
('Neighbor.com', 'Rent out your extra storage space to neighbors who need secure storage solutions', 'https://www.neighbor.com/favicon.ico', 'https://www.neighbor.com', 'https://www.neighbor.com/login', ARRAY['storage','garage','basement','shed'], 'Complete your Neighbor.com host profile with clear photos of your storage space and set competitive pricing.', 'https://www.neighbor.com/host', 50, 300, 9, true),
('Tesla Energy', 'Solar panels and energy storage solutions for your home', 'https://www.tesla.com/favicon.ico', 'https://www.tesla.com/energy', 'https://www.tesla.com/energy', ARRAY['solar','rooftop'], 'Schedule consultation for solar panel installation and energy storage solutions.', 'https://www.tesla.com/solar', 200, 800, 9, true),
('Honeygain', 'Share your unused internet bandwidth and earn passive income', 'https://honeygain.com/favicon.ico', 'https://honeygain.com', 'https://honeygain.com/login', ARRAY['internet','bandwidth','wifi'], 'Download the Honeygain app and create an account to start earning from your unused internet bandwidth.', 'https://r.honeygain.me/TIPTOP', 20, 80, 8, true),
('SpotHero', 'Monetize your parking space by renting it to drivers who need convenient parking', 'https://spothero.com/favicon.ico', 'https://spothero.com', 'https://spothero.com/login', ARRAY['parking','driveway','garage_parking'], 'Set up your SpotHero parking listing with clear photos and competitive pricing.', 'https://spothero.com/host', 75, 400, 7, true);