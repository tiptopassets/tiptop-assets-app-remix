-- Force Drop Duplicate Tables Added Today That Are Causing Conflicts
-- This will restore the clean state from yesterday

-- Drop the duplicate enhanced tables that conflict with original solar_api_cache
DROP TABLE IF EXISTS public.enhanced_solar_cache CASCADE;

-- Drop the duplicate property images table
DROP TABLE IF EXISTS public.user_property_images CASCADE;

-- Drop the duplicate supplier connections table  
DROP TABLE IF EXISTS public.user_supplier_connections CASCADE;

-- Clean up any orphaned indexes that might remain
DROP INDEX IF EXISTS idx_enhanced_solar_cache_address;
DROP INDEX IF EXISTS idx_enhanced_solar_cache_coordinates;
DROP INDEX IF EXISTS idx_user_property_images_user_analysis;
DROP INDEX IF EXISTS idx_user_supplier_connections_user_analysis;

-- Clean up any orphaned triggers
DROP TRIGGER IF EXISTS update_enhanced_solar_cache_updated_at ON public.enhanced_solar_cache;
DROP TRIGGER IF EXISTS update_user_property_images_updated_at ON public.user_property_images;
DROP TRIGGER IF EXISTS update_user_supplier_connections_updated_at ON public.user_supplier_connections;