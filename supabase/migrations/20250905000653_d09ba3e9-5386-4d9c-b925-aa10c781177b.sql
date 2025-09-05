-- Fix the RPC function security to work properly with authentication context
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
  -- Return user's own data (authenticated users can access their own data)
  -- OR admin users can access any user's data
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
      -- User requesting their own data
      auth.uid() = p_user_id OR
      -- OR user is an admin
      get_current_user_role() = 'admin'
    )
  ORDER BY created_at DESC;
$$;