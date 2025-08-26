-- Add Peerspace as a new service provider for various space rental opportunities
INSERT INTO enhanced_service_providers (
  name,
  description,
  logo,
  url,
  login_url,
  asset_types,
  supported_assets,
  setup_instructions,
  referral_link_template,
  commission_rate,
  avg_monthly_earnings_low,
  avg_monthly_earnings_high,
  priority,
  is_active,
  setup_requirements
) VALUES (
  'Peerspace',
  'Monetize your space by renting it out for coworking, events, content creation, photography, and art studios',
  'https://peerspace.com/favicon.ico',
  'https://peerspace.com',
  'https://peerspace.com/login',
  ARRAY['coworking', 'event-space', 'content-studio', 'photography-studio', 'art-studio', 'meeting-room'],
  ARRAY['coworking', 'event-space', 'content-studio', 'photography-studio', 'art-studio', 'meeting-room'],
  'List your space on Peerspace to earn money by renting it out for various activities including coworking, events, content creation, photography sessions, and art projects. Set your own rates and availability.',
  'https://www.peerspace.com/claim/gr-jdO4oxx4LGzq',
  0.15,
  200,
  2000,
  85,
  true,
  '{
    "space_type": "Define what type of space you have (office, studio, event venue, etc.)",
    "square_footage": "Minimum 100 sq ft recommended",
    "amenities": "List available amenities (WiFi, parking, equipment, etc.)",
    "photos": "High-quality photos of your space required",
    "availability": "Set your available hours and booking calendar"
  }'::jsonb
);