
-- Add missing partners to enhanced_service_providers table
-- First, let's add the missing Airbnb variations
INSERT INTO enhanced_service_providers (
  name, description, asset_types, avg_monthly_earnings_low, avg_monthly_earnings_high, 
  priority, is_active, url, login_url, logo, referral_link_template
) VALUES 
-- Airbnb Unit Rental
('Airbnb Unit Rental', 'Rent out your property or spare rooms to travelers on Airbnb', 
 ARRAY['airbnb', 'short_term_rental', 'rental', 'room_rental', 'guest_room', 'property'], 
 800, 3000, 10, true, 'https://www.airbnb.com', 'https://www.airbnb.com/host/homes',
 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9'),

-- Airbnb Experience
('Airbnb Experience', 'Create and host unique experiences for travelers in your area', 
 ARRAY['airbnb', 'experience', 'tours', 'activities', 'local_expertise', 'hosting'], 
 200, 1500, 8, true, 'https://www.airbnb.com', 'https://www.airbnb.com/experiences',
 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a'),

-- Airbnb Service
('Airbnb Service', 'Offer services to Airbnb hosts and guests in your area', 
 ARRAY['airbnb', 'services', 'cleaning', 'maintenance', 'hospitality'], 
 300, 2000, 7, true, 'https://www.airbnb.com', 'https://www.airbnb.com/host/services',
 'https://www.airbnb.com/favicon.ico', 'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b'),

-- Kolonia Energy
('Kolonia Energy', 'Solar energy solutions for Florida and Texas properties', 
 ARRAY['solar', 'rooftop', 'energy', 'renewable_energy'], 
 180, 750, 8, true, 'https://koloniahouse.com', 'https://koloniahouse.com',
 'https://koloniahouse.com/favicon.ico', 'https://koloniahouse.com'),

-- Honeygain
('Honeygain', 'Share your unused internet bandwidth for passive income', 
 ARRAY['internet', 'bandwidth', 'wifi'], 
 20, 80, 8, true, 'https://honeygain.com', 'https://dashboard.honeygain.com',
 'https://honeygain.com/favicon.ico', 'https://r.honeygain.me/EDUARCE2A5'),

-- Tesla Energy (ensure it exists with proper name matching)
('Tesla Energy', 'Install Tesla solar panels and energy storage systems', 
 ARRAY['solar', 'rooftop', 'energy', 'renewable_energy'], 
 200, 800, 9, true, 'https://www.tesla.com', 'https://www.tesla.com/solar',
 'https://www.tesla.com/favicon.ico', 'https://www.tesla.com/solar')

ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  asset_types = EXCLUDED.asset_types,
  avg_monthly_earnings_low = EXCLUDED.avg_monthly_earnings_low,
  avg_monthly_earnings_high = EXCLUDED.avg_monthly_earnings_high,
  priority = EXCLUDED.priority,
  is_active = EXCLUDED.is_active,
  url = EXCLUDED.url,
  login_url = EXCLUDED.login_url,
  logo = EXCLUDED.logo,
  referral_link_template = EXCLUDED.referral_link_template;

-- Remove duplicate Peerspace entries (keep only one)
DELETE FROM enhanced_service_providers 
WHERE name = 'Peerspace' 
AND id NOT IN (
  SELECT id FROM enhanced_service_providers 
  WHERE name = 'Peerspace' 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Update the remaining Peerspace entry to ensure it has all relevant asset types
UPDATE enhanced_service_providers 
SET asset_types = ARRAY['event_space', 'creative_space', 'meeting_room'],
    description = 'Rent your unique space for events and meetings',
    avg_monthly_earnings_low = 100,
    avg_monthly_earnings_high = 500,
    priority = 8,
    url = 'https://www.peerspace.com',
    login_url = 'https://www.peerspace.com/claim/gr-jdO4oxx4LGzq',
    logo = 'https://www.peerspace.com/favicon.ico',
    referral_link_template = 'http://www.peerspace.com/claim/gr-jdO4oxx4LGzq'
WHERE name = 'Peerspace';
