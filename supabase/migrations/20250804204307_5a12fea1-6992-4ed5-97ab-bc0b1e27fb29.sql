-- Grant admin role to specified users

-- Insert admin roles for the specified email addresses
-- We need to find their user IDs from the auth.users table first

INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin'::public.app_role
FROM auth.users au
WHERE au.email IN (
  'eduardosaba@gmail.com',
  'avtipoos@gmail.com', 
  'tiptopassets@gmail.com',
  'saarkraus@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = au.id AND ur.role = 'admin'
);

-- Verify the admin users were added
SELECT au.email, ur.role
FROM auth.users au
JOIN public.user_roles ur ON au.id = ur.user_id
WHERE au.email IN (
  'eduardosaba@gmail.com',
  'avtipoos@gmail.com', 
  'tiptopassets@gmail.com',
  'saarkraus@gmail.com'
);