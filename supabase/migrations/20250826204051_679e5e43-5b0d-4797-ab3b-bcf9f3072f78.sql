-- Update Grass referral link with the correct referral code
UPDATE enhanced_service_providers 
SET 
  referral_link_template = 'https://app.grass.io/register/?referralCode=nmGzz16893s4u-R',
  url = 'https://app.grass.io',
  login_url = 'https://app.grass.io/login',
  logo = 'https://app.grass.io/favicon.ico',
  updated_at = now()
WHERE name = 'Grass';