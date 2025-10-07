-- Clean up data contamination where analyses were wrongly linked to multiple users

-- Step 1: Unlink property analyses that don't have a matching journey linking them to the user
-- This fixes analyses that were incorrectly assigned to users who didn't create them
UPDATE public.user_property_analyses a
SET user_id = NULL, updated_at = now()
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_journey_complete j
    WHERE j.analysis_id = a.id 
      AND j.user_id = a.user_id
  );

-- Step 2: Unlink journey records where the analysis doesn't belong to that user
-- This fixes journey records that were incorrectly linked to users
UPDATE public.user_journey_complete j
SET user_id = NULL, updated_at = now()
WHERE j.user_id IS NOT NULL
  AND j.analysis_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_property_analyses a
    WHERE a.id = j.analysis_id 
      AND a.user_id = j.user_id
  );

-- Step 3: Also unlink asset selections that don't have matching analyses for the user
UPDATE public.user_asset_selections sel
SET user_id = NULL, updated_at = now()
WHERE sel.user_id IS NOT NULL
  AND sel.analysis_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_property_analyses a
    WHERE a.id = sel.analysis_id 
      AND a.user_id = sel.user_id
  );

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE 'Data contamination cleanup completed successfully';
END $$;