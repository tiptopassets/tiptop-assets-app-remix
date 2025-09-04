-- Create a unified view for all user analyses
-- This combines user_property_analyses and user_journey_complete data
CREATE OR REPLACE VIEW user_all_analyses AS
SELECT 
  upa.id,
  upa.user_id,
  upa.address_id,
  upa.total_monthly_revenue,
  upa.total_opportunities,
  upa.analysis_results,
  upa.property_type,
  upa.created_at,
  upa.updated_at,
  upa.coordinates,
  upa.satellite_image_url,
  'user_property_analyses' as source_table,
  -- Extract address from address_id lookup or analysis_results
  CASE 
    WHEN addr.formatted_address IS NOT NULL THEN addr.formatted_address
    WHEN addr.address IS NOT NULL THEN addr.address
    WHEN upa.analysis_results->>'propertyAddress' IS NOT NULL THEN upa.analysis_results->>'propertyAddress'
    WHEN upa.analysis_results->>'address' IS NOT NULL THEN upa.analysis_results->>'address'
    ELSE NULL
  END as property_address
FROM user_property_analyses upa
LEFT JOIN user_addresses addr ON upa.address_id = addr.id

UNION ALL

SELECT 
  ujc.id,
  ujc.user_id,
  NULL as address_id,
  ujc.total_monthly_revenue,
  ujc.total_opportunities,
  ujc.analysis_results,
  -- Extract property type from analysis results
  CASE 
    WHEN ujc.analysis_results->>'propertyType' IS NOT NULL THEN ujc.analysis_results->>'propertyType'
    ELSE 'Unknown'
  END as property_type,
  ujc.created_at,
  ujc.updated_at,
  ujc.property_coordinates as coordinates,
  -- Extract satellite image URL from analysis results
  CASE 
    WHEN ujc.analysis_results->'rooftop'->>'satelliteImageUrl' IS NOT NULL THEN ujc.analysis_results->'rooftop'->>'satelliteImageUrl'
    ELSE NULL
  END as satellite_image_url,
  'user_journey_complete' as source_table,
  ujc.property_address
FROM user_journey_complete ujc
WHERE ujc.user_id IS NOT NULL 
  AND ujc.analysis_results IS NOT NULL
  AND ujc.property_address IS NOT NULL
  AND ujc.property_address != ''
  -- Only include journey records that don't already exist in user_property_analyses
  AND NOT EXISTS (
    SELECT 1 FROM user_property_analyses upa 
    WHERE upa.user_id = ujc.user_id 
      AND upa.id = ujc.analysis_id
  );

-- Create a helper RPC function to get user analyses with proper security
CREATE OR REPLACE FUNCTION get_user_all_analyses(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  address_id uuid,
  total_monthly_revenue numeric,
  total_opportunities integer,
  analysis_results jsonb,
  property_type text,
  created_at timestamptz,
  updated_at timestamptz,
  coordinates jsonb,
  satellite_image_url text,
  source_table text,
  property_address text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return data if user is requesting their own data or is admin
  SELECT 
    uaa.id,
    uaa.user_id,
    uaa.address_id,
    uaa.total_monthly_revenue,
    uaa.total_opportunities,
    uaa.analysis_results,
    uaa.property_type,
    uaa.created_at,
    uaa.updated_at,
    uaa.coordinates,
    uaa.satellite_image_url,
    uaa.source_table,
    uaa.property_address
  FROM user_all_analyses uaa
  WHERE uaa.user_id = p_user_id
    AND (
      auth.uid() = p_user_id OR
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = auth.uid() 
          AND user_roles.role = 'admin'
      )
    )
  ORDER BY created_at DESC;
$$;

-- Create a simpler RPC to just get the count
CREATE OR REPLACE FUNCTION get_user_analyses_count(p_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM user_all_analyses 
  WHERE user_id = p_user_id
    AND (
      auth.uid() = p_user_id OR
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = auth.uid() 
          AND user_roles.role = 'admin'
      )
    );
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_all_analyses(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analyses_count(uuid) TO authenticated;