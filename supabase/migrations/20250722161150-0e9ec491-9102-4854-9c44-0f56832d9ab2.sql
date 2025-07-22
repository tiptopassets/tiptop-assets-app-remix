
-- Add missing partners that have clicks but aren't in enhanced_service_providers
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
) VALUES 
(
  'Honeygain',
  'Share your unused internet bandwidth and earn passive income',
  ARRAY['internet', 'bandwidth'],
  20,
  80,
  true,
  'https://honeygain.com/favicon.ico',
  'https://r.honeygain.me/EDUARCE2A5',
  8
),
(
  'Gympass',
  'Corporate wellness platform providing gym and fitness access',
  ARRAY['fitness', 'wellness'],
  0,
  50,
  true,
  'https://gympass.com/favicon.ico',
  'https://gympass.com/partners',
  5
),
(
  'Turo',
  'Peer-to-peer car sharing marketplace',
  ARRAY['vehicle', 'car'],
  200,
  1000,
  true,
  'https://turo.com/favicon.ico',
  'https://turo.com/us/en/list-your-car',
  7
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  asset_types = EXCLUDED.asset_types,
  avg_monthly_earnings_low = EXCLUDED.avg_monthly_earnings_low,
  avg_monthly_earnings_high = EXCLUDED.avg_monthly_earnings_high,
  is_active = EXCLUDED.is_active,
  logo = EXCLUDED.logo,
  login_url = EXCLUDED.login_url,
  priority = EXCLUDED.priority;
