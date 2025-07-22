-- Add admin access policy for partner_integration_progress table
CREATE POLICY "Admins can view all integration progress" 
ON public.partner_integration_progress 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);