
-- Add satellite_image_url and street_view_image_url columns to user_property_analyses table
ALTER TABLE user_property_analyses 
ADD COLUMN IF NOT EXISTS satellite_image_url TEXT,
ADD COLUMN IF NOT EXISTS street_view_image_url TEXT;

-- Add similar columns to enhanced_property_analyses table if needed
ALTER TABLE enhanced_property_analyses 
ADD COLUMN IF NOT EXISTS satellite_image_url TEXT,
ADD COLUMN IF NOT EXISTS street_view_image_url TEXT;

-- Add index for better query performance on image URLs
CREATE INDEX IF NOT EXISTS idx_user_property_analyses_satellite_image ON user_property_analyses(satellite_image_url) WHERE satellite_image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_property_analyses_street_view_image ON user_property_analyses(street_view_image_url) WHERE street_view_image_url IS NOT NULL;
