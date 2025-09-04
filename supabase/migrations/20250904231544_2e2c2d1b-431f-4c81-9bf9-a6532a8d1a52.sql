-- Step 1: Add unique constraint to user_addresses to prevent duplicate addresses per user
ALTER TABLE public.user_addresses 
ADD CONSTRAINT user_addresses_user_address_unique 
UNIQUE (user_id, address);

-- Step 2: Add admin RLS policies for better data visibility
CREATE POLICY "Admins can view all user addresses" 
ON public.user_addresses 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all user property analyses" 
ON public.user_property_analyses 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all user journey data" 
ON public.user_journey_complete 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all user asset selections" 
ON public.user_asset_selections 
FOR SELECT 
USING (get_current_user_role() = 'admin');