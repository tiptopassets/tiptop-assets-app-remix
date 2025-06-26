
-- Add missing columns to service_providers table
ALTER TABLE public.service_providers 
ADD COLUMN IF NOT EXISTS affiliate_program_url TEXT,
ADD COLUMN IF NOT EXISTS referral_link_template TEXT,
ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC(4,2) DEFAULT 2.5;

-- Create custom enum types for onboarding (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_option') THEN
        CREATE TYPE public.onboarding_option AS ENUM ('manual', 'concierge');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_status') THEN
        CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');
    END IF;
END $$;

-- Drop existing user_onboarding table and recreate with proper structure
DROP TABLE IF EXISTS public.user_onboarding CASCADE;

-- Create new user_onboarding table with proper structure
CREATE TABLE public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  selected_option public.onboarding_option NOT NULL,
  status public.onboarding_status NOT NULL DEFAULT 'not_started',
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 5,
  chat_history JSONB DEFAULT '[]'::jsonb,
  completed_assets TEXT[] DEFAULT '{}',
  progress_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bundle_configurations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bundle_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  asset_requirements TEXT[] DEFAULT '{}',
  min_assets INTEGER DEFAULT 1,
  max_providers_per_asset INTEGER DEFAULT 3,
  total_setup_cost NUMERIC DEFAULT 0,
  total_monthly_earnings_low NUMERIC DEFAULT 0,
  total_monthly_earnings_high NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create onboarding_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.onboarding_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can create their own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can update their own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Public read access to bundle configurations" ON public.bundle_configurations;
DROP POLICY IF EXISTS "Users can view messages for their onboarding sessions" ON public.onboarding_messages;
DROP POLICY IF EXISTS "Users can create messages for their onboarding sessions" ON public.onboarding_messages;

-- Create RLS policies for user_onboarding
CREATE POLICY "Users can view their own onboarding data" 
  ON public.user_onboarding FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding data" 
  ON public.user_onboarding FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data" 
  ON public.user_onboarding FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policy for bundle_configurations (public read)
CREATE POLICY "Public read access to bundle configurations" 
  ON public.bundle_configurations FOR SELECT 
  USING (true);

-- Create RLS policies for onboarding_messages
CREATE POLICY "Users can view messages for their onboarding sessions" 
  ON public.onboarding_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_onboarding 
      WHERE id = onboarding_messages.onboarding_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their onboarding sessions" 
  ON public.onboarding_messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_onboarding 
      WHERE id = onboarding_messages.onboarding_id 
      AND user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON public.user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_messages_onboarding_id ON public.onboarding_messages(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_bundle_configurations_active ON public.bundle_configurations(is_active);

-- Add foreign key constraints
ALTER TABLE public.onboarding_messages 
ADD CONSTRAINT fk_onboarding_messages_onboarding_id 
FOREIGN KEY (onboarding_id) REFERENCES public.user_onboarding(id) ON DELETE CASCADE;

-- Insert sample bundle configurations
INSERT INTO public.bundle_configurations (name, description, asset_requirements, min_assets, max_providers_per_asset, total_setup_cost, total_monthly_earnings_low, total_monthly_earnings_high) VALUES
('Solar + EV Bundle', 'Maximize your property with solar panels and EV charging', ARRAY['Solar Panel', 'EV Charger'], 2, 2, 500, 200, 800),
('Complete Property Bundle', 'Full monetization package for all property assets', ARRAY['Solar Panel', 'EV Charger', 'Swimming Pool', 'Parking Space'], 3, 3, 1200, 500, 2000),
('Sharing Economy Bundle', 'Share your spaces and earn passive income', ARRAY['Swimming Pool', 'Parking Space', 'Garden'], 2, 2, 100, 150, 600)
ON CONFLICT DO NOTHING;
