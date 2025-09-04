-- Fix analysis storage architecture by creating missing user_property_analyses records from journey data
-- This fixes users who analyzed properties while anonymous and later authenticated

DO $$
DECLARE
    journey_rec RECORD;
    new_address_id UUID;
    new_analysis_id UUID;
BEGIN
    -- Find all authenticated users with journey data but missing proper analysis records
    FOR journey_rec IN 
        SELECT DISTINCT 
            ujc.user_id,
            ujc.property_address,
            ujc.property_coordinates,
            ujc.analysis_results,
            ujc.total_monthly_revenue,
            ujc.total_opportunities,
            ujc.created_at,
            ujc.id as journey_id
        FROM user_journey_complete ujc
        WHERE ujc.user_id IS NOT NULL  -- Authenticated user
          AND ujc.analysis_results IS NOT NULL  -- Has analysis data
          AND ujc.property_address IS NOT NULL 
          AND ujc.property_address != ''  -- Has valid address
          AND NOT EXISTS (  -- But no corresponding analysis record
              SELECT 1 FROM user_property_analyses upa 
              WHERE upa.user_id = ujc.user_id 
              AND upa.analysis_results = ujc.analysis_results
          )
    LOOP
        RAISE NOTICE 'Migrating analysis for user % with address %', journey_rec.user_id, journey_rec.property_address;
        
        -- Create or find address record
        SELECT id INTO new_address_id 
        FROM user_addresses 
        WHERE user_id = journey_rec.user_id 
          AND (address = journey_rec.property_address OR formatted_address = journey_rec.property_address)
        LIMIT 1;
        
        IF new_address_id IS NULL THEN
            -- Create new address record
            INSERT INTO user_addresses (user_id, address, formatted_address, created_at)
            VALUES (journey_rec.user_id, journey_rec.property_address, journey_rec.property_address, journey_rec.created_at)
            RETURNING id INTO new_address_id;
            
            RAISE NOTICE 'Created new address record with ID %', new_address_id;
        END IF;
        
        -- Create the missing analysis record
        INSERT INTO user_property_analyses (
            user_id,
            address_id, 
            analysis_results,
            total_monthly_revenue,
            total_opportunities,
            coordinates,
            created_at,
            updated_at
        ) VALUES (
            journey_rec.user_id,
            new_address_id,
            journey_rec.analysis_results,
            COALESCE(journey_rec.total_monthly_revenue, 0),
            COALESCE(journey_rec.total_opportunities, 0),
            journey_rec.property_coordinates,
            journey_rec.created_at,
            journey_rec.created_at
        ) RETURNING id INTO new_analysis_id;
        
        RAISE NOTICE 'Created analysis record with ID %', new_analysis_id;
        
        -- Update the journey record to link to the analysis
        UPDATE user_journey_complete 
        SET analysis_id = new_analysis_id 
        WHERE id = journey_rec.journey_id;
        
        -- Link orphaned asset selections to this analysis
        UPDATE user_asset_selections 
        SET analysis_id = new_analysis_id
        WHERE user_id = journey_rec.user_id 
          AND analysis_id IS NULL;
        
        RAISE NOTICE 'Linked orphaned asset selections to analysis %', new_analysis_id;
        
    END LOOP;
    
    RAISE NOTICE 'Analysis migration completed successfully';
END $$;