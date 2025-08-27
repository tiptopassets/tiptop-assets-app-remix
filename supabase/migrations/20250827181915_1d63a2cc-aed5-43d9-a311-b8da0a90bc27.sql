-- Link all analyses created via journey records to the authenticated user
CREATE OR REPLACE FUNCTION public.link_user_analyses_from_journey(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.user_property_analyses
  SET user_id = p_user_id,
      updated_at = now()
  WHERE user_id IS NULL
    AND id IN (
      SELECT analysis_id
      FROM public.user_journey_complete
      WHERE user_id = p_user_id
        AND analysis_id IS NOT NULL
    );

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
