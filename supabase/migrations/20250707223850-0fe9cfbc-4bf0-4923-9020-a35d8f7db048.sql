-- Fix UUID constraint errors for OpenAI thread IDs
-- Change onboarding_id from UUID to TEXT to support OpenAI thread IDs

-- First, drop the foreign key constraint
ALTER TABLE onboarding_messages DROP CONSTRAINT IF EXISTS fk_onboarding_messages_onboarding_id;

-- Change the onboarding_id column type from UUID to TEXT
ALTER TABLE onboarding_messages ALTER COLUMN onboarding_id TYPE TEXT;

-- Also change user_onboarding.id to TEXT if it stores thread IDs
ALTER TABLE user_onboarding ALTER COLUMN id TYPE TEXT;

-- Update partner_integration_progress.onboarding_id to TEXT
ALTER TABLE partner_integration_progress ALTER COLUMN onboarding_id TYPE TEXT;

-- Update partner_recommendations.onboarding_id to TEXT  
ALTER TABLE partner_recommendations ALTER COLUMN onboarding_id TYPE TEXT;

-- Recreate the foreign key constraint with TEXT types
ALTER TABLE onboarding_messages 
ADD CONSTRAINT fk_onboarding_messages_onboarding_id 
FOREIGN KEY (onboarding_id) REFERENCES user_onboarding(id);

-- Update the default value generation for user_onboarding.id to handle TEXT
ALTER TABLE user_onboarding ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;