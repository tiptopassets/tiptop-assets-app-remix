-- Create a function to ensure all property analysis addresses are saved to user_addresses
CREATE OR REPLACE FUNCTION sync_analysis_addresses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analysis_row RECORD;
  address_text TEXT;
  existing_address_id UUID;
BEGIN
  -- Loop through all property analyses
  FOR analysis_row IN 
    SELECT id, user_id, analysis_results, address_id 
    FROM user_property_analyses 
    WHERE analysis_results IS NOT NULL
  LOOP
    -- Extract address from analysis_results
    IF analysis_row.analysis_results ? 'propertyAddress' THEN
      address_text := analysis_row.analysis_results->>'propertyAddress';
    ELSIF analysis_row.analysis_results ? 'address' THEN
      address_text := analysis_row.analysis_results->>'address';
    ELSE
      CONTINUE; -- Skip if no address found
    END IF;
    
    -- Skip if address is empty or just whitespace
    IF address_text IS NULL OR TRIM(address_text) = '' THEN
      CONTINUE;
    END IF;
    
    -- Check if address already exists for this user
    SELECT id INTO existing_address_id
    FROM user_addresses 
    WHERE user_id = analysis_row.user_id 
    AND (address = address_text OR formatted_address = address_text)
    LIMIT 1;
    
    -- If address doesn't exist, create it
    IF existing_address_id IS NULL THEN
      INSERT INTO user_addresses (user_id, address, formatted_address, is_primary)
      VALUES (
        analysis_row.user_id, 
        address_text, 
        address_text, 
        false
      )
      RETURNING id INTO existing_address_id;
      
      RAISE NOTICE 'Created address: % for user: %', address_text, analysis_row.user_id;
    END IF;
    
    -- Update analysis to link to the address if not already linked
    IF analysis_row.address_id IS NULL OR analysis_row.address_id != existing_address_id THEN
      UPDATE user_property_analyses 
      SET address_id = existing_address_id
      WHERE id = analysis_row.id;
      
      RAISE NOTICE 'Linked analysis % to address %', analysis_row.id, existing_address_id;
    END IF;
  END LOOP;
END;
$$;

-- Run the sync function
SELECT sync_analysis_addresses();