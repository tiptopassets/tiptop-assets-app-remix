
-- Add admin roles for the specified email addresses
-- Note: This will only work if these users have already signed up to the platform
-- The user_id values will be populated when users with these emails register

-- First, let's add the admin roles using a function that will handle the email-to-user-id mapping
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through each email and add admin role if user exists
    FOR user_record IN 
        SELECT id, email FROM auth.users 
        WHERE email IN ('avtipoos@gmail.com', 'tiptopassets@gmail.com', 'saarkraus@gmail.com')
    LOOP
        -- Insert admin role if it doesn't already exist
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_record.id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Added admin role for user: %', user_record.email;
    END LOOP;
    
    -- If no users found, provide information
    IF NOT FOUND THEN
        RAISE NOTICE 'No users found with the specified email addresses. Users must sign up first before admin roles can be assigned.';
    END IF;
END $$;
