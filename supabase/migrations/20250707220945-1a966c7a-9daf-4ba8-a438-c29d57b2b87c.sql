-- Populate enhanced_service_providers with partner data and referral links
INSERT INTO public.enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  referral_link_template,
  avg_monthly_earnings_low,
  avg_monthly_earnings_high,
  priority,
  is_active,
  setup_requirements,
  setup_instructions
) VALUES 
(
  'Neighbor.com',
  'Rent out your extra storage space to neighbors who need secure storage solutions',
  ARRAY['storage', 'garage', 'basement', 'shed'],
  'http://www.neighbor.com/invited/eduardo-944857?program_version=1',
  50,
  300,
  9,
  true,
  '{"documents": ["Property photos", "Government ID", "Bank account details"], "requirements": ["Clear storage space", "Access availability", "Insurance verification"], "setup_time": "15-30 minutes", "approval_time": "24-48 hours"}',
  'Complete your Neighbor.com host profile with clear photos of your storage space, set competitive pricing based on local market rates, and ensure easy access for renters.'
),
(
  'Peerspace',
  'Rent your unique space for events, meetings, photo shoots, and creative projects',
  ARRAY['event_space', 'creative_space', 'meeting_room', 'photo_studio'],
  'http://www.peerspace.com/claim/gr-jdO4oxx4LGzq',
  100,
  500,
  8,
  true,
  '{"documents": ["High-quality space photos", "Property insurance", "Government ID", "Tax information"], "requirements": ["Professional space presentation", "Flexible scheduling", "Guest accommodation"], "setup_time": "30-60 minutes", "approval_time": "3-5 business days"}',
  'Create an attractive Peerspace listing with professional photos, detailed amenities list, and clear availability calendar. Price competitively based on your space type and location.'
),
(
  'SpotHero',
  'Monetize your parking space by renting it to drivers who need convenient parking',
  ARRAY['parking', 'driveway', 'garage_parking'],
  'https://spothero.com/developers',
  75,
  400,
  7,
  true,
  '{"documents": ["Parking space photos", "Property verification", "Bank account"], "requirements": ["Clear parking access", "Defined parking boundaries", "Safety considerations"], "setup_time": "20-30 minutes", "approval_time": "2-3 business days"}',
  'Set up your SpotHero parking listing with clear photos showing space boundaries, access instructions, and any restrictions. Price based on location demand and local rates.'
),
(
  'Swimply',
  'Rent your pool by the hour to guests looking for a private swimming experience',
  ARRAY['pool', 'swimming_pool', 'hot_tub'],
  'https://swimply.com/referral?ref=MjQ0MTUyMw==&r=g&utm_medium=referral&utm_source=link&utm_campaign=2441523',
  150,
  800,
  10,
  true,
  '{"documents": ["Pool photos", "Liability insurance", "Safety equipment inventory", "Property permit"], "requirements": ["Pool safety compliance", "Clean and maintained pool", "Guest supervision capability"], "setup_time": "45-60 minutes", "approval_time": "5-7 business days"}',
  'Complete Swimply host verification with comprehensive pool photos, safety equipment documentation, and insurance verification. Set hourly rates based on pool features and local market.'
);

-- Add provider setup requirements for detailed onboarding guidance
INSERT INTO public.provider_setup_requirements (provider_id, requirement_key, requirement_value, requirement_type)
SELECT 
  esp.id,
  req_data.key,
  req_data.value,
  'string'
FROM public.enhanced_service_providers esp,
LATERAL (
  SELECT * FROM (
    VALUES 
    ('neighbor_step_1', 'Sign up using referral link'),
    ('neighbor_step_2', 'Upload clear photos of storage space'),
    ('neighbor_step_3', 'Set competitive monthly pricing'),
    ('neighbor_step_4', 'Complete identity verification'),
    ('neighbor_step_5', 'Add bank account for payments'),
    ('peerspace_step_1', 'Create host account via referral link'),
    ('peerspace_step_2', 'Take professional space photos'),
    ('peerspace_step_3', 'List all amenities and features'),
    ('peerspace_step_4', 'Set hourly/daily pricing'),
    ('peerspace_step_5', 'Complete background verification'),
    ('spothero_step_1', 'Register as parking partner'),
    ('spothero_step_2', 'Submit parking space photos'),
    ('spothero_step_3', 'Define parking boundaries clearly'),
    ('spothero_step_4', 'Set availability schedule'),
    ('spothero_step_5', 'Complete payment setup'),
    ('swimply_step_1', 'Join Swimply using referral code'),
    ('swimply_step_2', 'Upload pool and area photos'),
    ('swimply_step_3', 'Complete safety equipment checklist'),
    ('swimply_step_4', 'Verify liability insurance'),
    ('swimply_step_5', 'Set hourly rental rates')
  ) AS steps(key, value)
) req_data(key, value)
WHERE 
  (esp.name = 'Neighbor.com' AND req_data.key LIKE 'neighbor_%') OR
  (esp.name = 'Peerspace' AND req_data.key LIKE 'peerspace_%') OR
  (esp.name = 'SpotHero' AND req_data.key LIKE 'spothero_%') OR
  (esp.name = 'Swimply' AND req_data.key LIKE 'swimply_%');

-- Add provider supported assets mapping
INSERT INTO public.provider_supported_assets (provider_id, asset_type)
SELECT esp.id, asset_type
FROM public.enhanced_service_providers esp,
UNNEST(esp.asset_types) AS asset_type
WHERE esp.name IN ('Neighbor.com', 'Peerspace', 'SpotHero', 'Swimply');