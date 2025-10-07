-- Update the save_property_analysis function to ensure proper linking of analysis_id
-- across all related tables (journey, asset selections)

CREATE OR REPLACE FUNCTION public.save_property_analysis(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_property_address text DEFAULT NULL,
  p_coordinates jsonb DEFAULT NULL,
  p_analysis_results jsonb DEFAULT NULL,
  p_total_monthly_revenue numeric DEFAULT 0,
  p_total_opportunities integer DEFAULT 0,
  p_satellite_image_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_analysis_id uuid;
  v_address_id uuid;
BEGIN
  -- Create address record if user is authenticated and address is provided
  IF p_user_id IS NOT NULL AND p_property_address IS NOT NULL THEN
    INSERT INTO user_addresses (
      user_id, 
      address, 
      formatted_address, 
      latitude, 
      longitude
    ) VALUES (
      p_user_id,
      p_property_address,
      p_property_address,
      CASE WHEN p_coordinates ? 'lat' THEN (p_coordinates->>'lat')::real END,
      CASE WHEN p_coordinates ? 'lng' THEN (p_coordinates->>'lng')::real END
    )
    ON CONFLICT (user_id, address) DO UPDATE SET
      updated_at = now()
    RETURNING id INTO v_address_id;
  END IF;

  -- Create analysis record (works for both authenticated and anonymous users)
  INSERT INTO user_property_analyses (
    user_id,
    address_id,
    total_monthly_revenue,
    total_opportunities,
    analysis_results,
    coordinates,
    satellite_image_url,
    session_id
  ) VALUES (
    p_user_id,
    v_address_id,
    p_total_monthly_revenue,
    p_total_opportunities,
    p_analysis_results,
    p_coordinates,
    p_satellite_image_url,
    COALESCE(p_session_id, CONCAT('session_', extract(epoch from now())::text))
  )
  RETURNING id INTO v_analysis_id;

  -- CRITICAL: Update journey with analysis_id for both authenticated and anonymous users
  IF p_session_id IS NOT NULL THEN
    UPDATE user_journey_complete 
    SET 
      analysis_id = v_analysis_id,
      user_id = COALESCE(user_id, p_user_id), -- Preserve or set user_id
      property_address = COALESCE(property_address, p_property_address),
      property_coordinates = COALESCE(property_coordinates, p_coordinates),
      analysis_results = COALESCE(analysis_results, p_analysis_results),
      total_monthly_revenue = COALESCE(total_monthly_revenue, p_total_monthly_revenue),
      total_opportunities = COALESCE(total_opportunities, p_total_opportunities),
      updated_at = now()
    WHERE session_id = p_session_id;

    -- If no journey exists yet, create one with the analysis_id
    IF NOT FOUND THEN
      INSERT INTO user_journey_complete (
        session_id,
        user_id,
        analysis_id,
        property_address,
        property_coordinates,
        analysis_results,
        total_monthly_revenue,
        total_opportunities,
        current_step
      ) VALUES (
        p_session_id,
        p_user_id,
        v_analysis_id,
        p_property_address,
        p_coordinates,
        p_analysis_results,
        p_total_monthly_revenue,
        p_total_opportunities,
        'analysis_completed'
      );
    END IF;

    -- CRITICAL: Link asset selections to this analysis
    UPDATE user_asset_selections
    SET 
      analysis_id = v_analysis_id,
      user_id = COALESCE(user_id, p_user_id) -- Preserve or set user_id
    WHERE session_id = p_session_id 
      AND analysis_id IS NULL;
  END IF;

  RETURN v_analysis_id;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION public.save_property_analysis IS 'Saves property analysis and ensures proper linking across journey and asset selection tables. Works for both authenticated and anonymous users.';

-- Also update the repair function to be more robust
CREATE OR REPLACE FUNCTION public.repair_orphaned_user_selections(
  p_user_id uuid,
  p_analysis_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  updated_count1 INTEGER;
  updated_count2 INTEGER;
BEGIN
  -- Update orphaned selections that belong to this user but don't have an analysis_id
  UPDATE user_asset_selections
  SET 
    analysis_id = p_analysis_id,
    updated_at = now()
  WHERE user_id = p_user_id
    AND analysis_id IS NULL;

  GET DIAGNOSTICS updated_count1 = ROW_COUNT;
  
  -- Also try to link by session_id if available
  UPDATE user_asset_selections
  SET 
    analysis_id = p_analysis_id,
    user_id = p_user_id,
    updated_at = now()
  WHERE session_id IN (
    SELECT DISTINCT session_id 
    FROM user_journey_complete 
    WHERE user_id = p_user_id AND analysis_id = p_analysis_id
  )
  AND analysis_id IS NULL;
  
  GET DIAGNOSTICS updated_count2 = ROW_COUNT;

  RETURN updated_count1 + updated_count2;
END;
$$;