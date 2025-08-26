-- Add Grass as a new internet bandwidth sharing provider
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
  'Grass',
  'Turn your unused internet bandwidth into passive income by sharing it with the Grass network',
  'https://app.getgrass.io/favicon.ico',
  'https://app.getgrass.io',
  'https://app.getgrass.io/login',
  ARRAY['bandwidth', 'internet'],
  ARRAY['bandwidth', 'internet'],
  'Install the Grass extension or desktop app to start earning passive income by sharing your unused internet bandwidth with the Grass network. Easy setup with automatic earnings.',
  'https://app.getgrass.io/register/?referralCode=TIPTOP',
  0.0,
  15,
  60,
  88,
  true,
  '{
    "internet_connection": "Stable internet connection required",
    "device": "Chrome extension or desktop app",
    "bandwidth": "Minimum 10 Mbps recommended for optimal earnings",
    "location": "Available in most countries worldwide"
  }'::jsonb
);