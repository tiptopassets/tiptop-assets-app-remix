
-- First, let's add the referral links and partner information to the enhanced_service_providers table
INSERT INTO enhanced_service_providers (name, category, api_type, affiliate_base_url, supported_assets, priority_score, avg_earnings_low, avg_earnings_high, commission_rate, setup_requirements) VALUES
('Packet Stream', 'bandwidth', 'manual', 'https://packetstream.io/?psr=4CnQ', '["internet"]', 8, 20, 100, 5.00, '{"requirements": ["stable_internet", "device_availability"]}'),
('Honeygain', 'bandwidth', 'api', 'https://r.honeygain.me/TIPTOP999', '["internet"]', 9, 30, 150, 10.00, '{"requirements": ["stable_internet", "passive_sharing"]}'),
('Grass.io', 'bandwidth', 'manual', 'https://app.getgrass.io/register/?referralCode=DdXBGzUYc9bK5iq', '["internet"]', 7, 15, 80, 7.50, '{"requirements": ["browser_extension", "internet_sharing"]}'),
('Neighbor.com', 'storage', 'api', 'https://www.neighbor.com/host?ref=tiptop', '["storage", "garage", "basement"]', 8, 50, 300, 15.00, '{"requirements": ["storage_space", "insurance"]}'),
('Peerspace', 'space_rental', 'manual', 'https://www.peerspace.com/host?ref=tiptop', '["unique_spaces", "event_space"]', 6, 100, 500, 20.00, '{"requirements": ["unique_space", "hosting_capability"]}'),
('SpotHero', 'parking', 'api', 'https://spothero.com/partners?ref=tiptop', '["parking", "driveway"]', 9, 40, 200, 12.00, '{"requirements": ["parking_space", "urban_location"]}'),
('Swimply', 'pool_rental', 'api', 'https://swimply.com/for-hosts?ref=tiptop', '["pool"]', 8, 80, 400, 18.00, '{"requirements": ["pool", "safety_equipment", "insurance"]}');

-- Create a table for tracking partner integration progress
CREATE TABLE IF NOT EXISTS partner_integration_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  onboarding_id UUID REFERENCES user_onboarding(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  integration_status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed
  referral_link TEXT,
  registration_data JSONB DEFAULT '{}',
  earnings_data JSONB DEFAULT '{}',
  next_steps JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for partner integration progress
ALTER TABLE partner_integration_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own integration progress
CREATE POLICY "Users can view their own integration progress" 
  ON partner_integration_progress 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create a table for partner recommendations based on property analysis
CREATE TABLE IF NOT EXISTS partner_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES user_onboarding(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  priority_score INTEGER DEFAULT 0,
  estimated_monthly_earnings NUMERIC DEFAULT 0,
  setup_complexity TEXT DEFAULT 'medium', -- easy, medium, hard
  recommendation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for partner recommendations
ALTER TABLE partner_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access recommendations for their onboarding sessions
CREATE POLICY "Users can view recommendations for their onboarding" 
  ON partner_recommendations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_onboarding 
      WHERE id = partner_recommendations.onboarding_id 
      AND user_id = auth.uid()
    )
  );

-- Add trigger for updated_at timestamp on partner_integration_progress
CREATE TRIGGER update_partner_integration_progress_updated_at 
  BEFORE UPDATE ON partner_integration_progress 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
