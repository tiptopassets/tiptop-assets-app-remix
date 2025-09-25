-- Update referral link templates for partners with established affiliate relationships

-- Update Airbnb (assuming there's one main Airbnb entry - will need to check variants)
UPDATE enhanced_service_providers 
SET referral_link_template = 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=ace0bce8-693b-4430-95a4-d790ae402679'
WHERE name ILIKE '%airbnb%' AND (name NOT ILIKE '%experience%' AND name NOT ILIKE '%service%');

-- Update Honeygain
UPDATE enhanced_service_providers 
SET referral_link_template = 'https://join.honeygain.com/TIPTO9E10F'
WHERE name ILIKE '%honeygain%';

-- Update Neighbor.com
UPDATE enhanced_service_providers 
SET referral_link_template = 'https://www.neighbor.com/invited/eduardo-944857?program_version=1'
WHERE name ILIKE '%neighbor%';

-- Update Swimply  
UPDATE enhanced_service_providers 
SET referral_link_template = 'https://swimply.com/referral?ref=MjQ0MTUyMw==&r=g&utm_medium=referral&utm_source=link&utm_campaign=2441523'
WHERE name ILIKE '%swimply%';

-- Update Grass
UPDATE enhanced_service_providers 
SET referral_link_template = 'https://app.grass.io/register?referral=nmGzz16893s4u-R'
WHERE name ILIKE '%grass%';

-- Update Peerspace
UPDATE enhanced_service_providers 
SET referral_link_template = 'https://www.peerspace.com/claim/gr-jdO4oxx4LGzq'
WHERE name ILIKE '%peerspace%';

-- Add Sniffspot as a new partner
INSERT INTO enhanced_service_providers (
  name,
  description,
  url,
  login_url,
  asset_types,
  setup_instructions,
  referral_link_template,
  supported_assets,
  commission_rate,
  avg_monthly_earnings_low,
  avg_monthly_earnings_high,
  priority,
  is_active
) VALUES (
  'Sniffspot',
  'Rent out your yard or outdoor space for dogs to play and exercise',
  'https://www.sniffspot.com',
  'https://www.sniffspot.com/login',
  ARRAY['yard', 'garden', 'outdoor_space', 'pet_services'],
  'Sign up as a host on Sniffspot to rent out your yard or outdoor space for dog owners',
  'https://www.sniffspot.com/host',
  ARRAY['yard', 'garden', 'outdoor_space', 'pet_services'],
  15.0,
  100,
  500,
  8,
  true
);

-- Keep ChargePoint and Tesla Energy with NULL referral templates so they use homepage URLs