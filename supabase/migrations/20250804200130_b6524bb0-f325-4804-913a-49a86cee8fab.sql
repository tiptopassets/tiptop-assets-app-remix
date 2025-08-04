-- Add missing columns to user_journey_complete table for proper journey tracking
ALTER TABLE public.user_journey_complete 
ADD COLUMN IF NOT EXISTS session_id text,
ADD COLUMN IF NOT EXISTS current_step text DEFAULT 'address_entry',
ADD COLUMN IF NOT EXISTS property_coordinates jsonb,
ADD COLUMN IF NOT EXISTS selected_services jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS interested_services jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS selected_option text,
ADD COLUMN IF NOT EXISTS extra_form_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS journey_start_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS address_entered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS analysis_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS services_viewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS options_selected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS extra_data_filled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS auth_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS dashboard_accessed_at timestamp with time zone;

-- Add unique constraint on session_id to prevent duplicates (check if it doesn't exist first)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_journey_complete_session_id_unique'
    ) THEN
        ALTER TABLE public.user_journey_complete 
        ADD CONSTRAINT user_journey_complete_session_id_unique UNIQUE (session_id);
    END IF;
END $$;

-- Create index on session_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_journey_complete_session_id ON public.user_journey_complete(session_id);

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_journey_complete_user_id ON public.user_journey_complete(user_id);