-- Add admin policy to user_login_stats table to allow admins to view all login statistics
CREATE POLICY "Admins can view all user login stats" 
ON user_login_stats 
FOR SELECT 
USING (get_current_user_role() = 'admin'::text);