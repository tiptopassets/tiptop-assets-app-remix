
-- Create user_addresses table to store property addresses for each user
CREATE TABLE public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  formatted_address TEXT,
  coordinates JSONB,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, address)
);

-- Create user_property_analyses table to store analysis results
CREATE TABLE public.user_property_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address_id UUID REFERENCES public.user_addresses(id) ON DELETE CASCADE NOT NULL,
  analysis_results JSONB NOT NULL,
  analysis_version TEXT DEFAULT 'v1.0',
  total_monthly_revenue NUMERIC DEFAULT 0,
  total_opportunities INTEGER DEFAULT 0,
  property_type TEXT,
  coordinates JSONB,
  using_real_solar_data BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_asset_selections table to track which assets users select
CREATE TABLE public.user_asset_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.user_property_analyses(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL, -- 'solar', 'parking', 'pool', 'garden', 'bandwidth', 'storage'
  asset_data JSONB NOT NULL,
  monthly_revenue NUMERIC DEFAULT 0,
  setup_cost NUMERIC DEFAULT 0,
  roi_months INTEGER,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'selected' -- 'selected', 'setup_in_progress', 'active', 'inactive'
);

-- Create user_dashboard_preferences table to store dashboard settings
CREATE TABLE public.user_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  primary_address_id UUID REFERENCES public.user_addresses(id) ON DELETE SET NULL,
  dashboard_layout JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_property_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_asset_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_addresses
CREATE POLICY "Users can view their own addresses" 
  ON public.user_addresses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" 
  ON public.user_addresses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" 
  ON public.user_addresses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" 
  ON public.user_addresses FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_property_analyses
CREATE POLICY "Users can view their own analyses" 
  ON public.user_property_analyses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" 
  ON public.user_property_analyses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
  ON public.user_property_analyses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
  ON public.user_property_analyses FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_asset_selections
CREATE POLICY "Users can view their own asset selections" 
  ON public.user_asset_selections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own asset selections" 
  ON public.user_asset_selections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own asset selections" 
  ON public.user_asset_selections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own asset selections" 
  ON public.user_asset_selections FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_dashboard_preferences
CREATE POLICY "Users can view their own dashboard preferences" 
  ON public.user_dashboard_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard preferences" 
  ON public.user_dashboard_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard preferences" 
  ON public.user_dashboard_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard preferences" 
  ON public.user_dashboard_preferences FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX idx_user_property_analyses_user_id ON public.user_property_analyses(user_id);
CREATE INDEX idx_user_property_analyses_address_id ON public.user_property_analyses(address_id);
CREATE INDEX idx_user_asset_selections_user_id ON public.user_asset_selections(user_id);
CREATE INDEX idx_user_asset_selections_analysis_id ON public.user_asset_selections(analysis_id);
CREATE INDEX idx_user_dashboard_preferences_user_id ON public.user_dashboard_preferences(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_user_addresses_updated_at 
  BEFORE UPDATE ON public.user_addresses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_property_analyses_updated_at 
  BEFORE UPDATE ON public.user_property_analyses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_dashboard_preferences_updated_at 
  BEFORE UPDATE ON public.user_dashboard_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
