-- Create missing database functions only
CREATE OR REPLACE FUNCTION public.link_session_to_user(p_session_id text, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  linked_count INTEGER;
BEGIN
  UPDATE public.user_asset_selections 
  SET 
    user_id = p_user_id,
    session_id = NULL
  WHERE session_id = p_session_id 
    AND user_id IS NULL;
  
  GET DIAGNOSTICS linked_count = ROW_COUNT;
  
  UPDATE public.user_property_analyses 
  SET user_id = p_user_id
  WHERE id IN (
    SELECT DISTINCT analysis_id 
    FROM public.user_asset_selections 
    WHERE user_id = p_user_id 
      AND analysis_id IS NOT NULL
  );
  
  RETURN linked_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_asset_selections_with_analysis(p_session_id text, p_analysis_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.user_asset_selections 
  SET analysis_id = p_analysis_id
  WHERE session_id = p_session_id 
    AND analysis_id IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_journey_step(p_session_id text, p_step text, p_data jsonb DEFAULT '{}')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  journey_id UUID;
  step_timestamp_col TEXT;
BEGIN
  step_timestamp_col := CASE p_step
    WHEN 'address_entered' THEN 'address_entered_at'
    WHEN 'analysis_completed' THEN 'analysis_completed_at'
    WHEN 'services_viewed' THEN 'services_viewed_at'
    WHEN 'options_selected' THEN 'options_selected_at'
    WHEN 'extra_data_filled' THEN 'extra_data_filled_at'
    WHEN 'auth_completed' THEN 'auth_completed_at'
    WHEN 'dashboard_accessed' THEN 'dashboard_accessed_at'
    ELSE NULL
  END;

  INSERT INTO public.user_journey_complete (
    session_id,
    current_step,
    property_address,
    property_coordinates,
    analysis_results,
    analysis_id,
    total_monthly_revenue,
    total_opportunities,
    selected_services,
    interested_services,
    selected_option,
    extra_form_data
  ) VALUES (
    p_session_id,
    p_step,
    COALESCE(p_data->>'property_address', ''),
    p_data->'property_coordinates',
    p_data->'analysis_results',
    COALESCE((p_data->>'analysis_id')::uuid, NULL),
    COALESCE((p_data->>'total_monthly_revenue')::numeric, 0),
    COALESCE((p_data->>'total_opportunities')::integer, 0),
    COALESCE(p_data->'selected_services', '[]'::jsonb),
    COALESCE(p_data->'interested_services', '[]'::jsonb),
    p_data->>'selected_option',
    COALESCE(p_data->'extra_form_data', '{}'::jsonb)
  )
  ON CONFLICT (session_id) DO UPDATE SET
    current_step = p_step,
    property_address = COALESCE(EXCLUDED.property_address, user_journey_complete.property_address),
    property_coordinates = COALESCE(EXCLUDED.property_coordinates, user_journey_complete.property_coordinates),
    analysis_results = COALESCE(EXCLUDED.analysis_results, user_journey_complete.analysis_results),
    analysis_id = COALESCE(EXCLUDED.analysis_id, user_journey_complete.analysis_id),
    total_monthly_revenue = COALESCE(EXCLUDED.total_monthly_revenue, user_journey_complete.total_monthly_revenue),
    total_opportunities = COALESCE(EXCLUDED.total_opportunities, user_journey_complete.total_opportunities),
    selected_services = COALESCE(EXCLUDED.selected_services, user_journey_complete.selected_services),
    interested_services = COALESCE(EXCLUDED.interested_services, user_journey_complete.interested_services),
    selected_option = COALESCE(EXCLUDED.selected_option, user_journey_complete.selected_option),
    extra_form_data = COALESCE(EXCLUDED.extra_form_data, user_journey_complete.extra_form_data),
    updated_at = now()
  RETURNING id INTO journey_id;

  IF step_timestamp_col IS NOT NULL THEN
    EXECUTE format('UPDATE public.user_journey_complete SET %I = now() WHERE id = $1', step_timestamp_col) USING journey_id;
  END IF;

  RETURN journey_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.link_journey_to_user(p_session_id text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.user_journey_complete 
  SET 
    user_id = p_user_id,
    auth_completed_at = now(),
    updated_at = now()
  WHERE session_id = p_session_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(p_user_id uuid)
RETURNS TABLE(journey_id uuid, property_address text, analysis_results jsonb, analysis_id uuid, total_monthly_revenue numeric, total_opportunities integer, selected_services jsonb, selected_option text, journey_progress jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ujc.id,
    ujc.property_address,
    ujc.analysis_results,
    ujc.analysis_id,
    ujc.total_monthly_revenue,
    ujc.total_opportunities,
    ujc.selected_services,
    ujc.selected_option,
    jsonb_build_object(
      'steps_completed', array_remove(ARRAY[
        CASE WHEN ujc.address_entered_at IS NOT NULL THEN 'address_entered' END,
        CASE WHEN ujc.analysis_completed_at IS NOT NULL THEN 'analysis_completed' END,
        CASE WHEN ujc.services_viewed_at IS NOT NULL THEN 'services_viewed' END,
        CASE WHEN ujc.options_selected_at IS NOT NULL THEN 'options_selected' END,
        CASE WHEN ujc.auth_completed_at IS NOT NULL THEN 'auth_completed' END,
        CASE WHEN ujc.dashboard_accessed_at IS NOT NULL THEN 'dashboard_accessed' END
      ], NULL),
      'current_step', ujc.current_step,
      'journey_start', ujc.journey_start_at,
      'last_activity', ujc.updated_at
    )
  FROM public.user_journey_complete ujc
  WHERE ujc.user_id = p_user_id
  ORDER BY ujc.updated_at DESC
  LIMIT 1;
END;
$function$;