-- Create function to delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete all user data in order (to respect foreign key constraints)
  -- Note: Some tables have ON DELETE CASCADE so they'll be auto-deleted
  
  DELETE FROM public.affiliate_earnings WHERE user_id = v_user_id;
  DELETE FROM public.affiliate_credentials WHERE user_id = v_user_id;
  DELETE FROM public.affiliate_registrations WHERE user_id = v_user_id;
  DELETE FROM public.flexoffers_transactions WHERE user_id = v_user_id;
  DELETE FROM public.flexoffers_user_mapping WHERE user_id = v_user_id;
  DELETE FROM public.partner_clicks WHERE user_id = v_user_id;
  DELETE FROM public.partner_integration_progress WHERE user_id = v_user_id;
  DELETE FROM public.user_asset_selections WHERE user_id = v_user_id;
  DELETE FROM public.user_bundle_selections WHERE user_id = v_user_id;
  DELETE FROM public.user_dashboard_preferences WHERE user_id = v_user_id;
  DELETE FROM public.user_journey_complete WHERE user_id = v_user_id;
  DELETE FROM public.user_journey_progress WHERE user_id = v_user_id;
  DELETE FROM public.user_login_stats WHERE user_id = v_user_id;
  DELETE FROM public.user_onboarding WHERE user_id = v_user_id;
  DELETE FROM public.user_property_images WHERE user_id = v_user_id;
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  DELETE FROM public.user_service_selections WHERE user_id = v_user_id;
  DELETE FROM public.user_supplier_connections WHERE user_id = v_user_id;
  DELETE FROM public.visitor_sessions WHERE user_id = v_user_id;
  DELETE FROM public.user_property_analyses WHERE user_id = v_user_id;
  DELETE FROM public.user_addresses WHERE user_id = v_user_id;

  -- Finally, delete the auth user (this will cascade to any remaining references)
  DELETE FROM auth.users WHERE id = v_user_id;
  
END;
$$;