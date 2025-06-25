
-- Create table for provider supported assets (normalized)
CREATE TABLE IF NOT EXISTS public.provider_supported_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.enhanced_service_providers(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for provider setup requirements (normalized)
CREATE TABLE IF NOT EXISTS public.provider_setup_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.enhanced_service_providers(id) ON DELETE CASCADE,
  requirement_key TEXT NOT NULL,
  requirement_value TEXT NOT NULL,
  requirement_type TEXT DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_supported_assets_provider_id ON public.provider_supported_assets(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_supported_assets_asset_type ON public.provider_supported_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_provider_setup_requirements_provider_id ON public.provider_setup_requirements(provider_id);

-- Migrate existing JSONB data to normalized tables
-- First, migrate supported_assets
INSERT INTO public.provider_supported_assets (provider_id, asset_type)
SELECT 
  id as provider_id,
  jsonb_array_elements_text(supported_assets) as asset_type
FROM public.enhanced_service_providers 
WHERE supported_assets IS NOT NULL 
  AND jsonb_typeof(supported_assets) = 'array'
ON CONFLICT DO NOTHING;

-- Migrate setup_requirements
INSERT INTO public.provider_setup_requirements (provider_id, requirement_key, requirement_value, requirement_type)
SELECT 
  p.id as provider_id,
  req.key as requirement_key,
  CASE 
    WHEN jsonb_typeof(req.value) = 'string' THEN req.value #>> '{}'
    WHEN jsonb_typeof(req.value) = 'array' THEN array_to_string(ARRAY(SELECT jsonb_array_elements_text(req.value)), ',')
    ELSE req.value::text
  END as requirement_value,
  jsonb_typeof(req.value) as requirement_type
FROM public.enhanced_service_providers p,
     jsonb_each(p.setup_requirements) as req(key, value)
WHERE p.setup_requirements IS NOT NULL 
  AND jsonb_typeof(p.setup_requirements) = 'object'
ON CONFLICT DO NOTHING;

-- Add status column to track migration
ALTER TABLE public.enhanced_service_providers 
ADD COLUMN IF NOT EXISTS integration_status TEXT DEFAULT 'active';

-- Update integration_status for existing records
UPDATE public.enhanced_service_providers 
SET integration_status = 'active' 
WHERE integration_status IS NULL;
