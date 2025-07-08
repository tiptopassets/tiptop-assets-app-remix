
-- Create a security definer function to handle onboarding message insertion
-- This bypasses RLS since it runs with the function owner's privileges
CREATE OR REPLACE FUNCTION public.insert_onboarding_message(
  p_onboarding_id text,
  p_role text,
  p_content text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id uuid;
BEGIN
  -- Insert the message and return the ID
  INSERT INTO public.onboarding_messages (
    onboarding_id,
    role,
    content,
    metadata
  ) VALUES (
    p_onboarding_id,
    p_role,
    p_content,
    p_metadata
  )
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION public.insert_onboarding_message(text, text, text, jsonb) TO service_role;
