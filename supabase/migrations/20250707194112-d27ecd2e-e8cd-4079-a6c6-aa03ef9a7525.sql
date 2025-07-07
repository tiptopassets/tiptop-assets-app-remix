-- Modify user_asset_selections table to support anonymous users with session IDs
ALTER TABLE public.user_asset_selections 
ALTER COLUMN user_id DROP NOT NULL;

-- Add session_id column for anonymous users
ALTER TABLE public.user_asset_selections 
ADD COLUMN session_id TEXT;

-- Add index for session-based queries
CREATE INDEX idx_user_asset_selections_session_id ON public.user_asset_selections(session_id);

-- Create function to link session data to user when they authenticate
CREATE OR REPLACE FUNCTION public.link_session_to_user(
  p_session_id TEXT,
  p_user_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  linked_count INTEGER;
BEGIN
  -- Update asset selections from session to user
  UPDATE public.user_asset_selections 
  SET 
    user_id = p_user_id,
    session_id = NULL
  WHERE session_id = p_session_id 
    AND user_id IS NULL;
  
  GET DIAGNOSTICS linked_count = ROW_COUNT;
  
  -- Also link any analyses that might be session-based
  UPDATE public.user_property_analyses 
  SET user_id = p_user_id
  WHERE id IN (
    SELECT DISTINCT analysis_id 
    FROM public.user_asset_selections 
    WHERE user_id = p_user_id 
      AND analysis_id IS NOT NULL
  );
  
  RETURN linked_count;
END;
$$;