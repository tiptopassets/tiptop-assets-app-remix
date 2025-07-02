-- Rollback Schema Changes - Drop New Tables and Columns Created Today

-- Drop the new tables and their dependencies
DROP TABLE IF EXISTS public.enhanced_solar_cache CASCADE;
DROP TABLE IF EXISTS public.user_property_images CASCADE;
DROP TABLE IF EXISTS public.user_supplier_connections CASCADE;

-- Drop any indexes that were created for the new tables
DROP INDEX IF EXISTS idx_user_property_images_user_analysis;
DROP INDEX IF EXISTS idx_user_supplier_connections_user_analysis;
DROP INDEX IF EXISTS idx_enhanced_solar_cache_address;
DROP INDEX IF EXISTS idx_enhanced_solar_cache_coordinates;

-- Drop any triggers created for the new tables
DROP TRIGGER IF EXISTS update_enhanced_solar_cache_updated_at ON public.enhanced_solar_cache;
DROP TRIGGER IF EXISTS update_user_property_images_updated_at ON public.user_property_images;
DROP TRIGGER IF EXISTS update_user_supplier_connections_updated_at ON public.user_supplier_connections;

-- Remove the new columns added today from user_property_analyses
ALTER TABLE public.user_property_analyses 
DROP COLUMN IF EXISTS satellite_image_base64,
DROP COLUMN IF EXISTS street_view_image_url,
DROP COLUMN IF EXISTS property_images,
DROP COLUMN IF EXISTS supplier_info,
DROP COLUMN IF EXISTS solar_api_data,
DROP COLUMN IF EXISTS earnings_breakdown,
DROP COLUMN IF EXISTS last_solar_update,
DROP COLUMN IF EXISTS property_insights;