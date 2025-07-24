
-- First, let's add the missing partners to enhanced_service_providers
INSERT INTO enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  avg_monthly_earnings_low, 
  avg_monthly_earnings_high, 
  commission_rate, 
  priority, 
  is_active, 
  logo, 
  url, 
  login_url,
  referral_link_template
) VALUES 
-- Add Honeygain
(
  'Honeygain',
  'Share your unused internet bandwidth and earn passive income',
  ARRAY['internet', 'bandwidth', 'wifi'],
  20,
  80,
  0,
  8,
  true,
  'https://honeygain.com/favicon.ico',
  'https://honeygain.com',
  'https://honeygain.com/login',
  'https://r.honeygain.me/EDUARCE2A5'
),
-- Add Gympass (if it's a legitimate partner)
(
  'Gympass',
  'Corporate wellness platform for fitness and wellness services',
  ARRAY['fitness', 'wellness', 'home_gym'],
  100,
  500,
  0,
  6,
  true,
  'https://gympass.com/favicon.ico',
  'https://gympass.com',
  'https://gympass.com/login',
  null
),
-- Add Airbnb Unit Rental
(
  'Airbnb Unit Rental',
  'Rent out your property or spare rooms to travelers on Airbnb',
  ARRAY['short_term_rental', 'rental', 'room_rental', 'guest_room', 'property'],
  800,
  3000,
  0,
  10,
  true,
  'https://www.airbnb.com/favicon.ico',
  'https://www.airbnb.com',
  'https://www.airbnb.com/host',
  'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9'
),
-- Add Airbnb Experience
(
  'Airbnb Experience',
  'Create and host unique experiences for travelers in your area',
  ARRAY['experience', 'tours', 'activities', 'local_expertise', 'hosting'],
  200,
  1500,
  0,
  8,
  true,
  'https://www.airbnb.com/favicon.ico',
  'https://www.airbnb.com',
  'https://www.airbnb.com/host/experiences',
  'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a'
),
-- Add Airbnb Service
(
  'Airbnb Service',
  'Offer services to Airbnb hosts and guests in your area',
  ARRAY['services', 'cleaning', 'maintenance', 'hospitality'],
  300,
  2000,
  0,
  7,
  true,
  'https://www.airbnb.com/favicon.ico',
  'https://www.airbnb.com',
  'https://www.airbnb.com/host/services',
  'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b'
),
-- Add Kolonia Energy
(
  'Kolonia Energy',
  'Solar energy solutions for Florida and Texas properties',
  ARRAY['solar', 'rooftop', 'energy', 'renewable_energy'],
  180,
  750,
  0,
  8,
  true,
  'https://koloniahouse.com/favicon.ico',
  'https://koloniahouse.com',
  'https://koloniahouse.com/login',
  'https://koloniahouse.com'
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  asset_types = EXCLUDED.asset_types,
  avg_monthly_earnings_low = EXCLUDED.avg_monthly_earnings_low,
  avg_monthly_earnings_high = EXCLUDED.avg_monthly_earnings_high,
  logo = EXCLUDED.logo,
  url = EXCLUDED.url,
  login_url = EXCLUDED.login_url,
  referral_link_template = EXCLUDED.referral_link_template,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Remove duplicate Peerspace entries (keep the newer one from 2025-07-14)
DELETE FROM enhanced_service_providers 
WHERE name = 'Peerspace' 
  AND created_at < '2025-07-14'::date;

-- Update Tesla Energy to ensure proper naming
UPDATE enhanced_service_providers 
SET name = 'Tesla Energy'
WHERE name = 'Tesla' OR name = 'Tesla Solar';

-- Update any existing providers with missing logos
UPDATE enhanced_service_providers 
SET logo = CASE 
  WHEN name = 'Swimply' THEN 'https://swimply.com/favicon.ico'
  WHEN name = 'Neighbor.com' THEN 'https://www.neighbor.com/favicon.ico'
  WHEN name = 'SpotHero' THEN 'https://spothero.com/favicon.ico'
  WHEN name = 'Turo' THEN 'https://turo.com/favicon.ico'
  WHEN name = 'ChargePoint' THEN 'https://www.chargepoint.com/favicon.ico'
  WHEN name = 'EVgo' THEN 'https://www.evgo.com/favicon.ico'
  WHEN name = 'Little Free Library' THEN 'https://littlefreelibrary.org/favicon.ico'
  WHEN name = 'Peerspace' THEN 'https://www.peerspace.com/favicon.ico'
  ELSE logo
END
WHERE logo IS NULL OR logo = '';

-- Update partner_integration_progress to normalize partner names for better matching
UPDATE partner_integration_progress 
SET partner_name = CASE 
  WHEN partner_name = 'Tesla' OR partner_name = 'Tesla Solar' THEN 'Tesla Energy'
  WHEN partner_name = 'Neighbor' THEN 'Neighbor.com'
  WHEN partner_name = 'Honey Gain' THEN 'Honeygain'
  WHEN partner_name = 'Kolonia' OR partner_name = 'Kolonia House' THEN 'Kolonia Energy'
  WHEN partner_name = 'Airbnb' THEN 'Airbnb Unit Rental'
  ELSE partner_name
END
WHERE partner_name IN ('Tesla', 'Tesla Solar', 'Neighbor', 'Honey Gain', 'Kolonia', 'Kolonia House', 'Airbnb');
