
-- Drop existing policies that might conflict and recreate them
DROP POLICY IF EXISTS "Users can view their own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can create their own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can update their own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can view their own onboarding messages" ON public.onboarding_messages;
DROP POLICY IF EXISTS "Users can create their own onboarding messages" ON public.onboarding_messages;

-- Re-create all RLS policies for user_onboarding table
CREATE POLICY "Users can view their own onboarding data" 
  ON public.user_onboarding 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding data" 
  ON public.user_onboarding 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data" 
  ON public.user_onboarding 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for onboarding_messages table
CREATE POLICY "Users can view their own onboarding messages" 
  ON public.onboarding_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_onboarding 
      WHERE id = onboarding_messages.onboarding_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own onboarding messages" 
  ON public.onboarding_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_onboarding 
      WHERE id = onboarding_messages.onboarding_id 
      AND user_id = auth.uid()
    )
  );

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_onboarding_messages_onboarding_id'
    ) THEN
        ALTER TABLE public.onboarding_messages 
        ADD CONSTRAINT fk_onboarding_messages_onboarding_id 
        FOREIGN KEY (onboarding_id) REFERENCES public.user_onboarding(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add check constraint for message roles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_message_role'
    ) THEN
        ALTER TABLE public.onboarding_messages 
        ADD CONSTRAINT check_message_role 
        CHECK (role IN ('user', 'assistant', 'system'));
    END IF;
END $$;
