-- Fix RLS policies for user_asset_selections to allow anonymous asset selections

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own asset selections" ON public.user_asset_selections;
DROP POLICY IF EXISTS "Users can insert their own asset selections" ON public.user_asset_selections;
DROP POLICY IF EXISTS "Users can update their own asset selections" ON public.user_asset_selections;

-- Create new policies that allow anonymous access
CREATE POLICY "Allow anonymous asset selection inserts" 
ON public.user_asset_selections 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);

CREATE POLICY "Allow asset selection viewing" 
ON public.user_asset_selections 
FOR SELECT 
USING (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);

CREATE POLICY "Allow asset selection updates" 
ON public.user_asset_selections 
FOR UPDATE 
USING (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);