-- Fix the core data architecture issues

-- 1. Create a proper analysis saving function
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
AS $$
DECLARE
  v_analysis_id uuid;
  v_address_id uuid;
BEGIN
  -- Create address record if user is authenticated
  IF p_user_id IS NOT NULL AND p_property_address IS NOT NULL THEN
    INSERT INTO public.user_addresses (
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

  -- Create analysis record  
  INSERT INTO public.user_property_analyses (
    user_id,
    address_id,
    total_monthly_revenue,
    total_opportunities,
    analysis_results,
    coordinates,
    satellite_image_url
  ) VALUES (
    p_user_id,
    v_address_id,
    p_total_monthly_revenue,
    p_total_opportunities,
    p_analysis_results,
    p_coordinates,
    p_satellite_image_url
  )
  RETURNING id INTO v_analysis_id;

  -- Update journey with analysis_id
  IF p_session_id IS NOT NULL THEN
    UPDATE public.user_journey_complete 
    SET 
      analysis_id = v_analysis_id,
      property_address = COALESCE(property_address, p_property_address),
      analysis_results = COALESCE(analysis_results, p_analysis_results),
      total_monthly_revenue = COALESCE(total_monthly_revenue, p_total_monthly_revenue),
      total_opportunities = COALESCE(total_opportunities, p_total_opportunities),
      updated_at = now()
    WHERE session_id = p_session_id;

    -- Link asset selections to analysis
    UPDATE public.user_asset_selections
    SET analysis_id = v_analysis_id
    WHERE session_id = p_session_id AND analysis_id IS NULL;
  END IF;

  RETURN v_analysis_id;
END;
$$;

-- 2. Fix the linking functions to handle nullable user_id in analyses
CREATE OR REPLACE FUNCTION public.link_anonymous_analysis_to_user(
  p_session_id text,
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_analysis_id uuid;
  v_updated_count integer := 0;
BEGIN
  -- Get analysis_id from journey
  SELECT analysis_id INTO v_analysis_id
  FROM public.user_journey_complete
  WHERE session_id = p_session_id AND analysis_id IS NOT NULL
  LIMIT 1;

  IF v_analysis_id IS NOT NULL THEN
    -- Update analysis to link to user
    UPDATE public.user_property_analyses
    SET user_id = p_user_id, updated_at = now()
    WHERE id = v_analysis_id AND user_id IS NULL;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  END IF;

  -- Link journey to user
  UPDATE public.user_journey_complete
  SET user_id = p_user_id, updated_at = now()
  WHERE session_id = p_session_id;

  -- Link asset selections to user  
  UPDATE public.user_asset_selections
  SET user_id = p_user_id
  WHERE session_id = p_session_id AND user_id IS NULL;

  RETURN v_updated_count;
END;
$$;

-- 3. Make user_id nullable in user_property_analyses to support anonymous analyses
ALTER TABLE public.user_property_analyses 
ALTER COLUMN user_id DROP NOT NULL;

-- 4. Add session_id to user_property_analyses for better tracking
ALTER TABLE public.user_property_analyses 
ADD COLUMN IF NOT EXISTS session_id text;

-- 5. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_property_analyses_user_session 
ON public.user_property_analyses(user_id, session_id);

CREATE INDEX IF NOT EXISTS idx_user_asset_selections_analysis 
ON public.user_asset_selections(analysis_id);

-- 6. Update RLS policy to handle nullable user_id
DROP POLICY IF EXISTS "Users can view their own property analyses" ON public.user_property_analyses;

CREATE POLICY "Users can view their own property analyses" 
ON public.user_property_analyses 
FOR SELECT 
USING (
  (user_id IS NOT NULL AND auth.uid() = user_id) OR
  (user_id IS NULL AND session_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can insert their own property analyses" ON public.user_property_analyses;

CREATE POLICY "Users can insert their own property analyses" 
ON public.user_property_analyses 
FOR INSERT 
WITH CHECK (
  (user_id IS NOT NULL AND auth.uid() = user_id) OR
  (user_id IS NULL)
);

DROP POLICY IF EXISTS "Users can update their own property analyses" ON public.user_property_analyses;

CREATE POLICY "Users can update their own property analyses" 
ON public.user_property_analyses 
FOR UPDATE 
USING (
  (user_id IS NOT NULL AND auth.uid() = user_id) OR
  (user_id IS NULL)
);