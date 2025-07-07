-- Fix UUID constraint errors for OpenAI thread IDs
-- Step 1: Drop RLS policies that depend on onboarding_id

-- Drop policies on onboarding_messages table
DROP POLICY IF EXISTS "Users can view messages for their onboarding sessions" ON onboarding_messages;
DROP POLICY IF EXISTS "Users can create messages for their onboarding sessions" ON onboarding_messages;
DROP POLICY IF EXISTS "Public read access to onboarding messages" ON onboarding_messages;
DROP POLICY IF EXISTS "Public write access to onboarding messages" ON onboarding_messages;

-- Drop the foreign key constraint
ALTER TABLE onboarding_messages DROP CONSTRAINT IF EXISTS fk_onboarding_messages_onboarding_id;

-- Step 2: Change column types from UUID to TEXT
ALTER TABLE onboarding_messages ALTER COLUMN onboarding_id TYPE TEXT;
ALTER TABLE user_onboarding ALTER COLUMN id TYPE TEXT;
ALTER TABLE partner_integration_progress ALTER COLUMN onboarding_id TYPE TEXT;
ALTER TABLE partner_recommendations ALTER COLUMN onboarding_id TYPE TEXT;

-- Step 3: Update default value for user_onboarding.id
ALTER TABLE user_onboarding ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Step 4: Recreate the foreign key constraint
ALTER TABLE onboarding_messages 
ADD CONSTRAINT fk_onboarding_messages_onboarding_id 
FOREIGN KEY (onboarding_id) REFERENCES user_onboarding(id);

-- Step 5: Recreate RLS policies
CREATE POLICY "Users can view messages for their onboarding sessions" 
ON onboarding_messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_onboarding 
  WHERE user_onboarding.id = onboarding_messages.onboarding_id 
  AND user_onboarding.user_id = auth.uid()
));

CREATE POLICY "Users can create messages for their onboarding sessions" 
ON onboarding_messages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_onboarding 
  WHERE user_onboarding.id = onboarding_messages.onboarding_id 
  AND user_onboarding.user_id = auth.uid()
));

CREATE POLICY "Public read access to onboarding messages" 
ON onboarding_messages FOR SELECT 
USING (true);

CREATE POLICY "Public write access to onboarding messages" 
ON onboarding_messages FOR INSERT 
WITH CHECK (true);