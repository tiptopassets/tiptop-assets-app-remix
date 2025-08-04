-- Add missing columns to existing tables
ALTER TABLE user_property_analyses ADD COLUMN IF NOT EXISTS coordinates jsonb;
ALTER TABLE affiliate_registrations ADD COLUMN IF NOT EXISTS tracking_code text DEFAULT '';
ALTER TABLE affiliate_registrations ADD COLUMN IF NOT EXISTS total_earnings numeric DEFAULT 0;
ALTER TABLE affiliate_registrations ADD COLUMN IF NOT EXISTS last_sync_at timestamp with time zone DEFAULT now();
ALTER TABLE affiliate_registrations ADD COLUMN IF NOT EXISTS registration_status text DEFAULT 'pending';

-- Create missing tables that the code expects
CREATE TABLE IF NOT EXISTS user_asset_selections (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    analysis_id uuid,
    asset_type text NOT NULL,
    asset_data jsonb DEFAULT '{}',
    monthly_revenue numeric DEFAULT 0,
    setup_cost numeric DEFAULT 0,
    roi_months integer,
    selected_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'active',
    session_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_clicks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    partner_name text NOT NULL,
    referral_link text,
    created_at timestamp with time zone DEFAULT now(),
    integration_status text DEFAULT 'pending',
    click_count integer DEFAULT 1,
    conversion_count integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    primary_address_id uuid,
    dashboard_layout jsonb DEFAULT '{}',
    notification_settings jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE user_asset_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_asset_selections
CREATE POLICY "Users can view their own asset selections" 
ON user_asset_selections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own asset selections" 
ON user_asset_selections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own asset selections" 
ON user_asset_selections 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for partner_clicks
CREATE POLICY "Users can view their own partner clicks" 
ON partner_clicks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own partner clicks" 
ON partner_clicks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner clicks" 
ON partner_clicks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_dashboard_preferences
CREATE POLICY "Users can view their own dashboard preferences" 
ON user_dashboard_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard preferences" 
ON user_dashboard_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard preferences" 
ON user_dashboard_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_asset_selections_updated_at
BEFORE UPDATE ON user_asset_selections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_clicks_updated_at
BEFORE UPDATE ON partner_clicks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_dashboard_preferences_updated_at
BEFORE UPDATE ON user_dashboard_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();