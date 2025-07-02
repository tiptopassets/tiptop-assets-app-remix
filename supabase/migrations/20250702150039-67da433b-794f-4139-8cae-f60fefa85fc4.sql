-- Enhance user_property_analyses table to store comprehensive property data
-- Add columns for photos, images, and enhanced solar data

-- Add new columns to user_property_analyses table
ALTER TABLE public.user_property_analyses 
ADD COLUMN IF NOT EXISTS satellite_image_base64 TEXT,
ADD COLUMN IF NOT EXISTS street_view_image_url TEXT,
ADD COLUMN IF NOT EXISTS property_images JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS solar_api_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS earnings_breakdown JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_solar_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS property_insights JSONB DEFAULT '{}';

-- Create enhanced solar cache table for better solar data tracking
CREATE TABLE IF NOT EXISTS public.enhanced_solar_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_address TEXT NOT NULL,
  coordinates JSONB,
  raw_solar_response JSONB,
  formatted_solar_data JSONB,
  solar_potential_kwh NUMERIC,
  panel_count INTEGER,
  roof_area_sqft NUMERIC,
  annual_savings NUMERIC,
  setup_cost NUMERIC,
  using_real_data BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days')
);

-- Enable RLS on enhanced_solar_cache
ALTER TABLE public.enhanced_solar_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for enhanced_solar_cache
CREATE POLICY "Anyone can read enhanced solar cache" 
ON public.enhanced_solar_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage enhanced solar cache" 
ON public.enhanced_solar_cache 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create user_property_images table for storing multiple property images
CREATE TABLE IF NOT EXISTS public.user_property_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_id UUID REFERENCES public.user_property_analyses(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL, -- 'satellite', 'street_view', 'aerial', 'user_uploaded'
  image_url TEXT,
  image_base64 TEXT,
  image_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_property_images
ALTER TABLE public.user_property_images ENABLE ROW LEVEL SECURITY;

-- Create policies for user_property_images
CREATE POLICY "Users can view their own property images" 
ON public.user_property_images 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property images" 
ON public.user_property_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property images" 
ON public.user_property_images 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property images" 
ON public.user_property_images 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user_supplier_connections table to track user-supplier relationships
CREATE TABLE IF NOT EXISTS public.user_supplier_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_id UUID REFERENCES public.user_property_analyses(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  connection_status TEXT DEFAULT 'interested', -- 'interested', 'contacted', 'connected', 'active'
  estimated_revenue NUMERIC DEFAULT 0,
  setup_cost NUMERIC DEFAULT 0,
  supplier_data JSONB DEFAULT '{}',
  referral_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_supplier_connections
ALTER TABLE public.user_supplier_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for user_supplier_connections
CREATE POLICY "Users can manage their own supplier connections" 
ON public.user_supplier_connections 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_property_images_user_analysis 
ON public.user_property_images(user_id, analysis_id);

CREATE INDEX IF NOT EXISTS idx_user_supplier_connections_user_analysis 
ON public.user_supplier_connections(user_id, analysis_id);

CREATE INDEX IF NOT EXISTS idx_enhanced_solar_cache_address 
ON public.enhanced_solar_cache(property_address);

CREATE INDEX IF NOT EXISTS idx_enhanced_solar_cache_coordinates 
ON public.enhanced_solar_cache USING GIN(coordinates);

-- Add trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_enhanced_solar_cache_updated_at ON public.enhanced_solar_cache;
CREATE TRIGGER update_enhanced_solar_cache_updated_at
    BEFORE UPDATE ON public.enhanced_solar_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_property_images_updated_at ON public.user_property_images;
CREATE TRIGGER update_user_property_images_updated_at
    BEFORE UPDATE ON public.user_property_images
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_supplier_connections_updated_at ON public.user_supplier_connections;
CREATE TRIGGER update_user_supplier_connections_updated_at
    BEFORE UPDATE ON public.user_supplier_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();