-- Data cleanup: Link orphaned analyses to users
-- This will help fix historical data where analyses exist but aren't properly linked

-- Step 1: Link analyses that have session_id but no user_id to users via journey data
UPDATE user_property_analyses 
SET user_id = ujc.user_id
FROM user_journey_complete ujc
WHERE user_property_analyses.user_id IS NULL 
  AND user_property_analyses.session_id IS NOT NULL 
  AND ujc.session_id = user_property_analyses.session_id 
  AND ujc.user_id IS NOT NULL;

-- Step 2: Link analyses that have no user_id but exist in journey analysis_id references
UPDATE user_property_analyses 
SET user_id = ujc.user_id
FROM user_journey_complete ujc
WHERE user_property_analyses.user_id IS NULL 
  AND ujc.analysis_id = user_property_analyses.id 
  AND ujc.user_id IS NOT NULL;

-- Step 3: Link asset selections that have session_id but no user_id to users via journey data
UPDATE user_asset_selections 
SET user_id = ujc.user_id
FROM user_journey_complete ujc
WHERE user_asset_selections.user_id IS NULL 
  AND user_asset_selections.session_id IS NOT NULL 
  AND ujc.session_id = user_asset_selections.session_id 
  AND ujc.user_id IS NOT NULL;

-- Step 4: Fix asset selections that have no analysis_id but belong to users with analyses
UPDATE user_asset_selections 
SET analysis_id = latest_analysis.id
FROM (
  SELECT DISTINCT ON (user_id) user_id, id
  FROM user_property_analyses 
  WHERE user_id IS NOT NULL
  ORDER BY user_id, created_at DESC
) latest_analysis
WHERE user_asset_selections.user_id = latest_analysis.user_id 
  AND user_asset_selections.analysis_id IS NULL;