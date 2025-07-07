-- Update RLS policies for user_asset_selections to allow anonymous session-based inserts

-- Drop existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert their own asset selections" ON public.user_asset_selections;

-- Create new policy that allows both authenticated users and anonymous sessions
CREATE POLICY "Users and sessions can insert asset selections" 
ON public.user_asset_selections 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to insert their own selections
  (auth.uid() = user_id) OR 
  -- Allow anonymous users to insert with session_id when user_id is null
  (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);

-- Also update the select policy to allow reading session-based data
DROP POLICY IF EXISTS "Users can view their own asset selections" ON public.user_asset_selections;

CREATE POLICY "Users and sessions can view asset selections" 
ON public.user_asset_selections 
FOR SELECT 
USING (
  -- Authenticated users can see their own selections
  (auth.uid() = user_id) OR 
  -- Anyone can see session-based selections (they'll be filtered by session_id in the app)
  (user_id IS NULL AND session_id IS NOT NULL)
);