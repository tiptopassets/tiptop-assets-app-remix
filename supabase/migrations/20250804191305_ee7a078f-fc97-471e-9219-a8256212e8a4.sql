-- Create missing enums
CREATE TYPE public.onboarding_option AS ENUM ('manual', 'concierge');
CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');

-- Add missing columns to existing tables
ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;
ALTER TABLE user_property_analyses ADD COLUMN IF NOT EXISTS analysis_version text DEFAULT 'v1.0';
ALTER TABLE user_property_analyses ADD COLUMN IF NOT EXISTS using_real_solar_data boolean DEFAULT false;
ALTER TABLE user_property_analyses ADD COLUMN IF NOT EXISTS satellite_image_url text;

-- Update user_asset_selections to match expected structure
ALTER TABLE user_asset_selections 
  DROP COLUMN IF EXISTS session_id,
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'selected',
  ALTER COLUMN user_id DROP NOT NULL;

-- Create missing tables
CREATE TABLE IF NOT EXISTS user_property_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    analysis_id uuid,
    image_type text NOT NULL,
    image_url text,
    image_base64 text,
    image_metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_journey_complete (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL UNIQUE,
    user_id uuid,
    current_step text DEFAULT 'site_entry',
    property_address text,
    property_coordinates jsonb,
    analysis_results jsonb,
    analysis_id uuid,
    total_monthly_revenue numeric DEFAULT 0,
    total_opportunities integer DEFAULT 0,
    selected_services jsonb DEFAULT '[]',
    interested_services jsonb DEFAULT '[]',
    selected_option text,
    extra_form_data jsonb DEFAULT '{}',
    journey_start_at timestamp with time zone DEFAULT now(),
    journey_complete_at timestamp with time zone,
    site_entered_at timestamp with time zone DEFAULT now(),
    address_entered_at timestamp with time zone,
    analysis_completed_at timestamp with time zone,
    services_viewed_at timestamp with time zone,
    options_selected_at timestamp with time zone,
    extra_data_filled_at timestamp with time zone,
    auth_completed_at timestamp with time zone,
    dashboard_accessed_at timestamp with time zone,
    drop_off_step text,
    referrer text,
    landing_page text,
    user_agent text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    conversion_type text,
    ip_address inet,
    is_conversion boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_journey_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    session_id text,
    current_step text DEFAULT 'address_entry',
    option_selected text,
    address_entered boolean DEFAULT false,
    address_data jsonb,
    analysis_completed boolean DEFAULT false,
    analysis_id uuid,
    services_viewed boolean DEFAULT false,
    extra_data_filled boolean DEFAULT false,
    extra_data jsonb DEFAULT '{}',
    auth_completed boolean DEFAULT false,
    dashboard_accessed boolean DEFAULT false,
    step_completed_at jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visitor_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    user_id uuid,
    current_step text DEFAULT 'address_entry',
    property_address text,
    selected_option text,
    conversion_type text,
    journey_data jsonb DEFAULT '{}',
    analysis_data jsonb,
    selected_services jsonb DEFAULT '[]',
    extra_data jsonb DEFAULT '{}',
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    address_entered_at timestamp with time zone,
    analysis_completed_at timestamp with time zone,
    services_viewed_at timestamp with time zone,
    options_selected_at timestamp with time zone,
    auth_completed_at timestamp with time zone,
    dashboard_accessed_at timestamp with time zone,
    total_time_seconds integer,
    ip_address inet,
    user_agent text,
    referrer text,
    landing_page text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_onboarding (
    id text PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    user_id uuid NOT NULL,
    selected_option onboarding_option NOT NULL,
    status onboarding_status NOT NULL DEFAULT 'not_started',
    current_step integer DEFAULT 1,
    total_steps integer DEFAULT 5,
    completed_assets text[] DEFAULT '{}',
    chat_history jsonb DEFAULT '[]',
    progress_data jsonb DEFAULT '{}',
    onboarding_data jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_id text NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_supported_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid NOT NULL,
    asset_type text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_setup_requirements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid NOT NULL,
    requirement_key text NOT NULL,
    requirement_value text NOT NULL,
    requirement_type text DEFAULT 'string',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS available_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id uuid,
    service_type text NOT NULL,
    service_name text NOT NULL,
    monthly_revenue_low numeric DEFAULT 0,
    monthly_revenue_high numeric DEFAULT 0,
    setup_cost numeric DEFAULT 0,
    roi_months integer,
    requirements jsonb DEFAULT '{}',
    provider_info jsonb DEFAULT '{}',
    is_available boolean DEFAULT true,
    priority_score integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_service_selections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    journey_id uuid,
    available_service_id uuid,
    selection_type text DEFAULT 'interested',
    notes text,
    priority integer DEFAULT 0,
    selected_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_supplier_connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    supplier_name text NOT NULL,
    asset_type text NOT NULL,
    connection_status text DEFAULT 'interested',
    analysis_id uuid,
    referral_link text,
    estimated_revenue numeric DEFAULT 0,
    setup_cost numeric DEFAULT 0,
    supplier_data jsonb DEFAULT '{}',
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solar_api_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_address text NOT NULL,
    coordinates jsonb,
    solar_data jsonb NOT NULL,
    cached_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enhanced_solar_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_address text NOT NULL,
    coordinates jsonb,
    raw_solar_response jsonb,
    formatted_solar_data jsonb,
    solar_potential_kwh numeric,
    panel_count integer,
    roof_area_sqft numeric,
    annual_savings numeric,
    setup_cost numeric,
    using_real_data boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval)
);

CREATE TABLE IF NOT EXISTS journey_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL DEFAULT CURRENT_DATE,
    total_visitors integer DEFAULT 0,
    unique_visitors integer DEFAULT 0,
    returning_visitors integer DEFAULT 0,
    addresses_entered integer DEFAULT 0,
    analyses_completed integer DEFAULT 0,
    services_viewed integer DEFAULT 0,
    options_selected integer DEFAULT 0,
    auths_completed integer DEFAULT 0,
    dashboards_accessed integer DEFAULT 0,
    address_conversion_rate numeric DEFAULT 0,
    analysis_conversion_rate numeric DEFAULT 0,
    service_view_rate numeric DEFAULT 0,
    option_selection_rate numeric DEFAULT 0,
    auth_conversion_rate numeric DEFAULT 0,
    dashboard_conversion_rate numeric DEFAULT 0,
    popular_services jsonb DEFAULT '[]',
    manual_vs_concierge jsonb DEFAULT '{"manual": 0, "concierge": 0}',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_id text NOT NULL,
    partner_name text NOT NULL,
    asset_type text NOT NULL,
    setup_complexity text DEFAULT 'medium',
    recommendation_reason text,
    referral_link text,
    priority_score integer DEFAULT 0,
    estimated_monthly_earnings numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_integration_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    onboarding_id text NOT NULL,
    partner_name text NOT NULL,
    integration_status text DEFAULT 'pending',
    referral_link text,
    registration_data jsonb DEFAULT '{}',
    earnings_data jsonb DEFAULT '{}',
    next_steps text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE user_property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey_complete ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_supported_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_setup_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_service_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplier_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_solar_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_integration_progress ENABLE ROW LEVEL SECURITY;