
-- Add satellite_image_url column to user_property_analyses table
ALTER TABLE user_property_analyses 
ADD COLUMN satellite_image_url TEXT;

-- Add street_view_image_url column for future use
ALTER TABLE user_property_analyses 
ADD COLUMN street_view_image_url TEXT;
