
-- Create enum for onboarding option types
CREATE TYPE public.onboarding_option AS ENUM ('manual', 'concierge');

-- Create enum for onboarding status
CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');

-- Create table to store user onboarding selections and progress
CREATE TABLE public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  selected_option onboarding_option NOT NULL,
  status onboarding_status NOT NULL DEFAULT 'not_started',
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 5,
  chat_history JSONB DEFAULT '[]'::jsonb,
  completed_assets TEXT[] DEFAULT ARRAY[]::TEXT[],
  progress_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies for user onboarding data
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

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_onboarding_updated_at
    BEFORE UPDATE ON public.user_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_user_onboarding_updated_at();

-- Create table to store onboarding messages/chat history
CREATE TABLE public.onboarding_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID REFERENCES public.user_onboarding(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for onboarding messages
ALTER TABLE public.onboarding_messages ENABLE ROW LEVEL SECURITY;

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
