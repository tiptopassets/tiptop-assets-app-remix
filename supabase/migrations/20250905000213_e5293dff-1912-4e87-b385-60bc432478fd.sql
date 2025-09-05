-- Fix the unified view to handle cases where property_address is empty but extractable from analysis_results
DROP VIEW IF EXISTS user_all_analyses;

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
  -- Use property_address if available, otherwise extract from analysis_results
  CASE 
    WHEN ujc.property_address IS NOT NULL AND ujc.property_address != '' THEN ujc.property_address
    WHEN ujc.analysis_results->>'propertyAddress' IS NOT NULL THEN ujc.analysis_results->>'propertyAddress'
    WHEN ujc.analysis_results->>'address' IS NOT NULL THEN ujc.analysis_results->>'address'
    ELSE NULL
  END as property_address
FROM user_journey_complete ujc
WHERE ujc.user_id IS NOT NULL 
  AND ujc.analysis_results IS NOT NULL
  -- More flexible address check - either property_address exists or it's extractable from analysis_results
  AND (
    (ujc.property_address IS NOT NULL AND ujc.property_address != '') OR
    ujc.analysis_results->>'propertyAddress' IS NOT NULL OR
    ujc.analysis_results->>'address' IS NOT NULL
  )
  -- Only include journey records that don't already exist in user_property_analyses
  AND NOT EXISTS (
    SELECT 1 FROM user_property_analyses upa 
    WHERE upa.user_id = ujc.user_id 
      AND upa.id = ujc.analysis_id
  );