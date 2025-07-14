
-- First, let's add all the missing partners to enhanced_service_providers table
-- This will consolidate all partners in one place for the admin dashboard

-- Insert Grass.io (Internet/bandwidth sharing)
INSERT INTO public.enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  avg_monthly_earnings_low, 
  avg_monthly_earnings_high, 
  is_active, 
  logo, 
  login_url,
  priority
) VALUES (
  'Grass.io',
  'Share your unused internet bandwidth and earn passive income',
  ARRAY['internet', 'bandwidth'],
  15,
  50,
  true,
  'https://grass.io/favicon.ico',
  'https://app.getgrass.io/register',
  8
);

-- Insert Sniffspot (Dog park/yard rental)
INSERT INTO public.enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  avg_monthly_earnings_low, 
  avg_monthly_earnings_high, 
  is_active, 
  logo, 
  login_url,
  priority
) VALUES (
  'Sniffspot',
  'Rent out your yard as a private dog park for pet owners',
  ARRAY['yard', 'garden'],
  100,
  500,
  true,
  'https://www.sniffspot.com/favicon.ico',
  'https://www.sniffspot.com/host',
  7
);

-- Insert Giggster (Event space rental)
INSERT INTO public.enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  avg_monthly_earnings_low, 
  avg_monthly_earnings_high, 
  is_active, 
  logo, 
  login_url,
  priority
) VALUES (
  'Giggster',
  'Rent your property for film shoots, photo sessions, and events',
  ARRAY['event_space', 'home_interior'],
  200,
  1000,
  true,
  'https://www.giggster.com/favicon.ico',
  'https://www.giggster.com/list-your-location',
  6
);

-- Insert Peerspace (Event space rental)
INSERT INTO public.enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  avg_monthly_earnings_low, 
  avg_monthly_earnings_high, 
  is_active, 
  logo, 
  login_url,
  priority
) VALUES (
  'Peerspace',
  'List your unique space for meetings, events, and productions',
  ARRAY['event_space', 'home_interior'],
  150,
  800,
  true,
  'https://www.peerspace.com/favicon.ico',
  'https://www.peerspace.com/host',
  5
);

-- Migrate existing service_providers data to enhanced_service_providers
-- First, let's add Tesla Energy if it doesn't exist
INSERT INTO public.enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  avg_monthly_earnings_low, 
  avg_monthly_earnings_high, 
  is_active, 
  logo, 
  login_url,
  priority
) 
SELECT 
  'Tesla Energy',
  'Solar panels and energy storage solutions for your home',
  ARRAY['solar', 'rooftop'],
  200,
  800,
  true,
  'https://www.tesla.com/favicon.ico',
  'https://www.tesla.com/energy',
  9
WHERE NOT EXISTS (
  SELECT 1 FROM public.enhanced_service_providers WHERE name = 'Tesla Energy'
);

-- Update Honeygain if it exists to have proper asset types
UPDATE public.enhanced_service_providers 
SET 
  asset_types = ARRAY['internet', 'bandwidth'],
  description = CASE 
    WHEN description IS NULL OR description = '' 
    THEN 'Share your unused internet bandwidth and earn passive income'
    ELSE description
  END,
  avg_monthly_earnings_low = COALESCE(avg_monthly_earnings_low, 20),
  avg_monthly_earnings_high = COALESCE(avg_monthly_earnings_high, 80)
WHERE name = 'Honeygain';

-- Update any other existing providers to have proper asset types if they don't
UPDATE public.enhanced_service_providers 
SET asset_types = ARRAY['general']
WHERE asset_types IS NULL OR array_length(asset_types, 1) IS NULL;
