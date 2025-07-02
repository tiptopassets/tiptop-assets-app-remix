-- Safe Schema Rollback - Only drop columns that exist from user_property_analyses
-- Check and remove new columns one by one

-- Remove the new columns added from user_property_analyses if they exist
DO $$ 
BEGIN
    -- Drop satellite_image_base64 if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_property_analyses' 
               AND column_name = 'satellite_image_base64') THEN
        ALTER TABLE public.user_property_analyses DROP COLUMN satellite_image_base64;
    END IF;

    -- Drop street_view_image_url if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_property_analyses' 
               AND column_name = 'street_view_image_url') THEN
        ALTER TABLE public.user_property_analyses DROP COLUMN street_view_image_url;
    END IF;

    -- Drop property_images if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_property_analyses' 
               AND column_name = 'property_images') THEN
        ALTER TABLE public.user_property_analyses DROP COLUMN property_images;
    END IF;

    -- Drop supplier_info if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_property_analyses' 
               AND column_name = 'supplier_info') THEN
        ALTER TABLE public.user_property_analyses DROP COLUMN supplier_info;
    END IF;

    -- Drop solar_api_data if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_property_analyses' 
               AND column_name = 'solar_api_data') THEN
        ALTER TABLE public.user_property_analyses DROP COLUMN solar_api_data;
    END IF;

    -- Drop earnings_breakdown if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_property_analyses' 
               AND column_name = 'earnings_breakdown') THEN
        ALTER TABLE public.user_property_analyses DROP COLUMN earnings_breakdown;
    END IF;

    -- Drop last_solar_update if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_property_analyses' 
               AND column_name = 'last_solar_update') THEN
        ALTER TABLE public.user_property_analyses DROP COLUMN last_solar_update;
    END IF;

    -- Drop property_insights if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_property_analyses' 
               AND column_name = 'property_insights') THEN
        ALTER TABLE public.user_property_analyses DROP COLUMN property_insights;
    END IF;
END $$;