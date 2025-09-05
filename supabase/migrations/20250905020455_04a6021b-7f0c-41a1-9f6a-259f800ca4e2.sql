-- Repair the specific orphaned asset selections for this user
-- Link the recent Garden Space Rental and Parking Space Rental selections to the correct analysis

UPDATE user_asset_selections 
SET analysis_id = '099a5a80-2672-45ae-9f3a-280ee1a88ac3'
WHERE user_id = '1cf10fa7-ce27-4525-bb3f-a211b0cb1725'
  AND analysis_id IS NULL
  AND selected_at >= '2025-09-05 00:50:00'
  AND asset_type IN ('Garden Space Rental', 'Parking Space Rental');

-- Create a function to automatically repair orphaned selections for a specific analysis
CREATE OR REPLACE FUNCTION repair_recent_orphaned_selections(p_user_id uuid, p_analysis_id uuid, p_time_threshold interval DEFAULT '1 hour'::interval)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Update recent orphaned selections to link them to the provided analysis
  UPDATE user_asset_selections
  SET analysis_id = p_analysis_id,
      updated_at = now()
  WHERE user_id = p_user_id
    AND analysis_id IS NULL
    AND selected_at >= (now() - p_time_threshold);
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$;