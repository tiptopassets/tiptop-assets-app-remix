-- Fix RLS policies for enhanced_service_providers to use proper admin role checking
DROP POLICY IF EXISTS "Admins can manage all providers" ON enhanced_service_providers;
DROP POLICY IF EXISTS "Public read access for active providers" ON enhanced_service_providers;

-- Create proper admin policy using the user_roles system
CREATE POLICY "Admins can manage all providers" 
ON enhanced_service_providers 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Keep public read access for active providers
CREATE POLICY "Public read access for active providers" 
ON enhanced_service_providers 
FOR SELECT 
USING (is_active = true);

-- Add some sample partner data
INSERT INTO enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  avg_monthly_earnings_low, 
  avg_monthly_earnings_high, 
  priority, 
  is_active,
  url,
  login_url
) VALUES 
(
  'Airbnb', 
  'Short-term rental platform for additional income',
  ARRAY['short_term_rental', 'rental'],
  500,
  2000,
  100,
  true,
  'https://airbnb.com',
  'https://airbnb.com/host'
),
(
  'Honeygain', 
  'Share unused internet bandwidth for passive income',
  ARRAY['bandwidth', 'internet'],
  20,
  50,
  90,
  true,
  'https://honeygain.com',
  'https://honeygain.com/signup'
),
(
  'Tesla Energy', 
  'Solar panel installation and energy solutions',
  ARRAY['solar', 'rooftop', 'energy'],
  200,
  800,
  85,
  true,
  'https://tesla.com/energy',
  'https://tesla.com/energy/design'
),
(
  'ChargePoint', 
  'EV charging station network for homeowners',
  ARRAY['ev_charging', 'parking'],
  100,
  400,
  80,
  true,
  'https://chargepoint.com',
  'https://chargepoint.com/products/home'
),
(
  'Neighbor.com', 
  'Storage space rental marketplace',
  ARRAY['storage', 'parking'],
  50,
  300,
  75,
  true,
  'https://neighbor.com',
  'https://neighbor.com/host'
),
(
  'Swimply', 
  'Pool sharing platform for pool owners',
  ARRAY['pool', 'event_space'],
  100,
  600,
  70,
  true,
  'https://swimply.com',
  'https://swimply.com/list-your-pool'
);

-- Enable realtime for partner integration progress table (if not already enabled)
ALTER TABLE partner_integration_progress REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE partner_integration_progress;