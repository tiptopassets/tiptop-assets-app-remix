-- Make analysis_id nullable in user_asset_selections table to support anonymous users
ALTER TABLE public.user_asset_selections 
ALTER COLUMN analysis_id DROP NOT NULL;

-- Create function to update asset selections with analysis_id when it becomes available
CREATE OR REPLACE FUNCTION public.update_asset_selections_with_analysis(
  p_session_id TEXT,
  p_analysis_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update asset selections that don't have an analysis_id yet
  UPDATE public.user_asset_selections 
  SET analysis_id = p_analysis_id
  WHERE session_id = p_session_id 
    AND analysis_id IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$;