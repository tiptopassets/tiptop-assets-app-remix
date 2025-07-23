
-- Add Airbnb partners with the specific referral links
INSERT INTO public.enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  referral_link_template,
  avg_monthly_earnings_low,
  avg_monthly_earnings_high,
  priority,
  is_active,
  logo,
  login_url
) VALUES 
(
  'Airbnb Unit Rental',
  'Rent out your property or spare rooms to travelers on Airbnb',
  ARRAY['short_term_rental', 'rental', 'room_rental'],
  'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9',
  800,
  3000,
  10,
  true,
  'https://www.airbnb.com/favicon.ico',
  'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9'
),
(
  'Airbnb Experience',
  'Create and host unique experiences for travelers in your area',
  ARRAY['experience', 'tours', 'activities'],
  'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a',
  200,
  1500,
  8,
  true,
  'https://www.airbnb.com/favicon.ico',
  'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a'
),
(
  'Airbnb Service',
  'Offer services to Airbnb hosts and guests in your area',
  ARRAY['services', 'cleaning', 'maintenance'],
  'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b',
  300,
  2000,
  7,
  true,
  'https://www.airbnb.com/favicon.ico',
  'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b'
),
(
  'Tesla Solar',
  'Install Tesla solar panels and energy storage systems',
  ARRAY['solar', 'rooftop', 'energy'],
  'https://www.tesla.com/solar',
  200,
  800,
  9,
  true,
  'https://www.tesla.com/favicon.ico',
  'https://www.tesla.com/solar'
),
(
  'Kolonia Energy',
  'Solar energy solutions for Florida and Texas properties',
  ARRAY['solar', 'rooftop', 'energy'],
  'https://koloniahouse.com',
  180,
  750,
  8,
  true,
  'https://koloniahouse.com/favicon.ico',
  'https://koloniahouse.com'
),
(
  'Little Free Library',
  'Start a Little Free Library in your neighborhood',
  ARRAY['library', 'community', 'books'],
  'https://littlefreelibrary.org/start/',
  0,
  50,
  6,
  true,
  'https://littlefreelibrary.org/favicon.ico',
  'https://littlefreelibrary.org/start/'
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  asset_types = EXCLUDED.asset_types,
  referral_link_template = EXCLUDED.referral_link_template,
  avg_monthly_earnings_low = EXCLUDED.avg_monthly_earnings_low,
  avg_monthly_earnings_high = EXCLUDED.avg_monthly_earnings_high,
  priority = EXCLUDED.priority,
  is_active = EXCLUDED.is_active,
  logo = EXCLUDED.logo,
  login_url = EXCLUDED.login_url;

-- Add EV charging partners
INSERT INTO public.enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  referral_link_template,
  avg_monthly_earnings_low,
  avg_monthly_earnings_high,
  priority,
  is_active,
  logo,
  login_url
) VALUES 
(
  'ChargePoint',
  'Install EV charging stations and earn from usage fees',
  ARRAY['ev_charging', 'parking', 'charging'],
  'https://www.chargepoint.com/businesses/property-managers/',
  100,
  500,
  7,
  true,
  'https://www.chargepoint.com/favicon.ico',
  'https://www.chargepoint.com/businesses/property-managers/'
),
(
  'EVgo',
  'Partner with EVgo to install fast charging stations',
  ARRAY['ev_charging', 'parking', 'charging'],
  'https://www.evgo.com/partners/',
  150,
  600,
  8,
  true,
  'https://www.evgo.com/favicon.ico',
  'https://www.evgo.com/partners/'
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  asset_types = EXCLUDED.asset_types,
  referral_link_template = EXCLUDED.referral_link_template,
  avg_monthly_earnings_low = EXCLUDED.avg_monthly_earnings_low,
  avg_monthly_earnings_high = EXCLUDED.avg_monthly_earnings_high,
  priority = EXCLUDED.priority,
  is_active = EXCLUDED.is_active,
  logo = EXCLUDED.logo,
  login_url = EXCLUDED.login_url;
