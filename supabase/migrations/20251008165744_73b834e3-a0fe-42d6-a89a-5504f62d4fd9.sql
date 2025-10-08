-- Add admin roles for specified users
-- This will grant admin access to saarkraus@gmail.com and tiptopassets@gmail.com

INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id,
  'admin'::app_role
FROM auth.users au
WHERE au.email IN ('saarkraus@gmail.com', 'tiptopassets@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;