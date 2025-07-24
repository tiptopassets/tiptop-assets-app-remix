
-- Add missing partners that users are already clicking on
INSERT INTO enhanced_service_providers (
  name, description, logo, url, login_url, asset_types, 
  avg_monthly_earnings_low, avg_monthly_earnings_high, 
  priority, is_active, setup_instructions, referral_link_template
) VALUES 
-- Honeygain (users are clicking this but it's missing)
('Honeygain', 'Share your unused internet bandwidth and earn passive income', 
 'https://honeygain.com/favicon.ico', 'https://honeygain.com', 'https://honeygain.com/login',
 ARRAY['internet', 'bandwidth', 'wifi'], 20, 80, 8, true,
 'Download the Honeygain app and create an account to start earning from your unused internet bandwidth.',
 'https://r.honeygain.me/EDUARCE2A5'),

-- Gympass (users are clicking this but it's missing)
('Gympass', 'Corporate wellness platform for fitness and wellness services',
 'https://gympass.com/favicon.ico', 'https://gympass.com', 'https://gympass.com/login',
 ARRAY['fitness', 'wellness', 'home_gym'], 100, 500, 6, true,
 'Sign up as a wellness provider and offer fitness services through the Gympass platform.',
 'https://gympass.com'),

-- Airbnb Unit Rental (separate from generic airbnb)
('Airbnb Unit Rental', 'Rent out your property or spare rooms to travelers on Airbnb',
 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com', 'https://www.airbnb.com/login',
 ARRAY['short_term_rental', 'rental', 'room_rental', 'guest_room', 'property'], 800, 3000, 10, true,
 'Create a host profile, upload property photos, set pricing and availability, complete verification.',
 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9'),

-- Airbnb Experience
('Airbnb Experience', 'Create and host unique experiences for travelers in your area',
 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com/experiences', 'https://www.airbnb.com/login',
 ARRAY['experience', 'tours', 'activities', 'local_expertise', 'hosting'], 200, 1500, 8, true,
 'Define your experience concept, create detailed description, set pricing, complete host verification.',
 'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a'),

-- Airbnb Service
('Airbnb Service', 'Offer services to Airbnb hosts and guests in your area',
 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com/help', 'https://www.airbnb.com/login',
 ARRAY['services', 'cleaning', 'maintenance', 'hospitality'], 300, 2000, 7, true,
 'Define service offerings, set pricing, complete verification, start accepting bookings.',
 'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b'),

-- Kolonia Energy (solar partner)
('Kolonia Energy', 'Solar energy solutions for Florida and Texas properties',
 'https://koloniahouse.com/favicon.ico', 'https://koloniahouse.com', 'https://koloniahouse.com/login',
 ARRAY['solar', 'rooftop', 'energy', 'renewable_energy'], 180, 750, 8, true,
 'Schedule initial consultation, complete roof evaluation, review system design, proceed with installation.',
 'https://koloniahouse.com')

ON CONFLICT (name) DO NOTHING;

-- Update missing logos for existing partners
UPDATE enhanced_service_providers 
SET logo = CASE 
  WHEN name = 'Swimply' THEN 'https://swimply.com/favicon.ico'
  WHEN name = 'Neighbor.com' THEN 'https://www.neighbor.com/favicon.ico'
  WHEN name = 'SpotHero' THEN 'https://spothero.com/favicon.ico'
  WHEN name = 'Peerspace' THEN 'https://www.peerspace.com/favicon.ico'
  WHEN name = 'Turo' THEN 'https://turo.com/favicon.ico'
  WHEN name = 'Tesla Energy' THEN 'https://www.tesla.com/favicon.ico'
  WHEN name = 'ChargePoint' THEN 'https://www.chargepoint.com/favicon.ico'
  WHEN name = 'EVgo' THEN 'https://www.evgo.com/favicon.ico'
  WHEN name = 'Little Free Library' THEN 'https://littlefreelibrary.org/favicon.ico'
  ELSE logo
END
WHERE logo IS NULL OR logo = '';

-- Update referral links for partners that might be missing them
UPDATE enhanced_service_providers 
SET referral_link_template = CASE 
  WHEN name = 'Swimply' THEN 'https://swimply.com/referral?ref=MjQ0MTUyMw==&r=g&utm_medium=referral&utm_source=link&utm_campaign=2441523'
  WHEN name = 'Neighbor.com' THEN 'http://www.neighbor.com/invited/eduardo-944857?program_version=1'
  WHEN name = 'Peerspace' THEN 'http://www.peerspace.com/claim/gr-jdO4oxx4LGzq'
  WHEN name = 'SpotHero' THEN 'https://spothero.com/developers'
  WHEN name = 'Turo' THEN 'https://turo.com/us/en/list-your-car'
  WHEN name = 'Tesla Energy' THEN 'https://www.tesla.com/solar'
  WHEN name = 'ChargePoint' THEN 'https://www.chargepoint.com/businesses/property-managers/'
  WHEN name = 'EVgo' THEN 'https://www.evgo.com/partners/'
  WHEN name = 'Little Free Library' THEN 'https://littlefreelibrary.org/start/'
  ELSE referral_link_template
END
WHERE referral_link_template IS NULL OR referral_link_template = '';
