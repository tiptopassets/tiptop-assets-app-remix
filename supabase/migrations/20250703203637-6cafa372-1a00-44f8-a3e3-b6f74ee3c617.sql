-- Create admin-specific RLS policies for viewing all data

-- Admin policies for user_login_stats
CREATE POLICY "Admins can view all login stats" 
ON public.user_login_stats 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admin policies for user_property_analyses  
CREATE POLICY "Admins can view all property analyses"
ON public.user_property_analyses
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admin policies for affiliate_earnings
CREATE POLICY "Admins can view all affiliate earnings"
ON public.affiliate_earnings 
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admin policies for user_addresses
CREATE POLICY "Admins can view all user addresses"
ON public.user_addresses
FOR SELECT
TO authenticated  
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admin policies for user_journey_complete
CREATE POLICY "Admins can view all journey data"
ON public.user_journey_complete
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);