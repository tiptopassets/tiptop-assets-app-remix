-- Add admin SELECT policy on partner_integration_progress for admin dashboard
CREATE POLICY "Admins can view all partner integration progress" 
ON public.partner_integration_progress 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add performance indexes for partner click tracking
CREATE INDEX IF NOT EXISTS idx_partner_integration_progress_partner_name_created 
ON public.partner_integration_progress (partner_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_integration_progress_status_created 
ON public.partner_integration_progress (integration_status, created_at DESC);

-- Enable realtime for partner_integration_progress
ALTER TABLE public.partner_integration_progress REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_integration_progress;