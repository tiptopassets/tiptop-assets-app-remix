
-- First, remove the duplicate Peerspace entries (keep the newer one from 2025-07-14)
DELETE FROM enhanced_service_providers 
WHERE name = 'Peerspace' AND created_at < '2025-07-14';

-- Update Tesla to Tesla Energy if it exists
UPDATE enhanced_service_providers 
SET name = 'Tesla Energy' 
WHERE name = 'Tesla';

-- Add missing partners with proper data
INSERT INTO enhanced_service_providers (
  name, description, logo, url, login_url, asset_types, 
  avg_monthly_earnings_low, avg_monthly_earnings_high, 
  priority, is_active, referral_link_template
) VALUES 
-- Honeygain
('Honeygain', 'Share your unused internet bandwidth and earn passive income', 
 'https://honeygain.com/favicon.ico', 'https://honeygain.com', 'https://r.honeygain.me/EDUARCE2A5',
 ARRAY['internet', 'bandwidth', 'wifi'], 20, 80, 8, true, 'https://r.honeygain.me/EDUARCE2A5'),

-- Gympass
('Gympass', 'Corporate wellness platform for fitness and wellness services',
 'https://gympass.com/favicon.ico', 'https://gympass.com', 'https://gympass.com',
 ARRAY['fitness', 'wellness', 'home_gym'], 100, 500, 6, true, 'https://gympass.com'),

-- Airbnb Unit Rental
('Airbnb Unit Rental', 'Rent out your property or spare rooms to travelers on Airbnb',
 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com', 
 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9',
 ARRAY['short_term_rental', 'rental', 'room_rental', 'guest_room', 'property'], 
 800, 3000, 10, true, 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9'),

-- Airbnb Experience
('Airbnb Experience', 'Create and host unique experiences for travelers in your area',
 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com',
 'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a',
 ARRAY['experience', 'tours', 'activities', 'local_expertise', 'hosting'],
 200, 1500, 8, true, 'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a'),

-- Airbnb Service
('Airbnb Service', 'Offer services to Airbnb hosts and guests in your area',
 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com',
 'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b',
 ARRAY['services', 'cleaning', 'maintenance', 'hospitality'],
 300, 2000, 7, true, 'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b'),

-- Kolonia Energy
('Kolonia Energy', 'Solar energy solutions for Florida and Texas properties',
 'https://koloniahouse.com/favicon.ico', 'https://koloniahouse.com', 'https://koloniahouse.com',
 ARRAY['solar', 'rooftop', 'energy', 'renewable_energy'], 180, 750, 8, true, 'https://koloniahouse.com')

ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  logo = EXCLUDED.logo,
  url = EXCLUDED.url,
  login_url = EXCLUDED.login_url,
  asset_types = EXCLUDED.asset_types,
  avg_monthly_earnings_low = EXCLUDED.avg_monthly_earnings_low,
  avg_monthly_earnings_high = EXCLUDED.avg_monthly_earnings_high,
  priority = EXCLUDED.priority,
  referral_link_template = EXCLUDED.referral_link_template;

-- Update existing providers that have missing logos
UPDATE enhanced_service_providers 
SET logo = CASE 
  WHEN name = 'Tesla Energy' THEN 'https://www.tesla.com/favicon.ico'
  WHEN name = 'Swimply' THEN 'https://swimply.com/favicon.ico'
  WHEN name = 'Peerspace' THEN 'https://www.peerspace.com/favicon.ico'
  WHEN name = 'Neighbor.com' THEN 'https://www.neighbor.com/favicon.ico'
  WHEN name = 'SpotHero' THEN 'https://spothero.com/favicon.ico'
  WHEN name = 'Turo' THEN 'https://turo.com/favicon.ico'
  WHEN name = 'ChargePoint' THEN 'https://www.chargepoint.com/favicon.ico'
  WHEN name = 'EVgo' THEN 'https://www.evgo.com/favicon.ico'
  WHEN name = 'Little Free Library' THEN 'https://littlefreelibrary.org/favicon.ico'
  ELSE logo
END
WHERE logo IS NULL OR logo = '';

-- Remove any incorrect entries that shouldn't be there
DELETE FROM enhanced_service_providers 
WHERE name IN ('Grass.io', 'Sniffspot', 'Giggster');
