-- Make user_id nullable to allow anonymous journey tracking
ALTER TABLE public.user_journey_complete 
ALTER COLUMN user_id DROP NOT NULL;

-- Add unique constraint on session_id to prevent duplicates
ALTER TABLE public.user_journey_complete 
ADD CONSTRAINT unique_session_id UNIQUE (session_id);

-- Update the update_journey_step function to handle anonymous users
CREATE OR REPLACE FUNCTION public.update_journey_step(p_session_id text, p_step text, p_data jsonb DEFAULT '{}'::jsonb)
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
    user_id,
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
    auth.uid(), -- Will be NULL for anonymous users
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
    user_id = COALESCE(auth.uid(), user_journey_complete.user_id), -- Preserve existing user_id if auth.uid() is null
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

-- Update link_journey_to_user to handle linking anonymous sessions
CREATE OR REPLACE FUNCTION public.link_journey_to_user(p_session_id text, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.user_journey_complete 
  SET 
    user_id = p_user_id,
    auth_completed_at = COALESCE(auth_completed_at, now()),
    updated_at = now()
  WHERE session_id = p_session_id;
END;
$function$;

-- Update RLS policies to allow anonymous journey tracking
DROP POLICY IF EXISTS "Users can insert their own journey data" ON public.user_journey_complete;
DROP POLICY IF EXISTS "Users can update their own journey data" ON public.user_journey_complete;
DROP POLICY IF EXISTS "Users can view their own journey data" ON public.user_journey_complete;

-- Allow anonymous users to insert journey data
CREATE POLICY "Allow anonymous journey tracking" 
ON public.user_journey_complete 
FOR INSERT 
WITH CHECK (true);

-- Allow updates for anonymous sessions and authenticated users
CREATE POLICY "Allow journey updates" 
ON public.user_journey_complete 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Allow users to view their own journey data and anonymous sessions
CREATE POLICY "Allow journey viewing" 
ON public.user_journey_complete 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);