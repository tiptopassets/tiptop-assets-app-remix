
-- Create RPC function to check if a user has a FlexOffers mapping
CREATE OR REPLACE FUNCTION public.has_flexoffers_mapping(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  has_mapping BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM flexoffers_user_mapping
    WHERE user_id = user_id_param
  ) INTO has_mapping;
  
  RETURN has_mapping;
END;
$$;

-- Create RPC function to get a user's FlexOffers mapping
CREATE OR REPLACE FUNCTION public.get_flexoffers_user_mapping()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  sub_affiliate_id TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.user_id, m.sub_affiliate_id, m.created_at
  FROM flexoffers_user_mapping m
  WHERE m.user_id = auth.uid();
END;
$$;

-- Create RPC function to create a FlexOffers mapping
CREATE OR REPLACE FUNCTION public.create_flexoffers_mapping(
  user_id_param UUID,
  sub_affiliate_id_param TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  mapping_id UUID;
BEGIN
  -- First, delete any existing mapping for this user
  DELETE FROM flexoffers_user_mapping
  WHERE user_id = user_id_param;
  
  -- Create new mapping
  INSERT INTO flexoffers_user_mapping (user_id, sub_affiliate_id)
  VALUES (user_id_param, sub_affiliate_id_param)
  RETURNING id INTO mapping_id;
  
  RETURN mapping_id;
END;
$$;

-- Create RPC function to delete a FlexOffers mapping
CREATE OR REPLACE FUNCTION public.delete_flexoffers_mapping(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  deleted BOOLEAN;
BEGIN
  DELETE FROM flexoffers_user_mapping
  WHERE user_id = user_id_param;
  
  GET DIAGNOSTICS deleted = ROW_COUNT;
  
  RETURN deleted > 0;
END;
$$;

-- Create RPC function to get a user's sub-affiliate ID
CREATE OR REPLACE FUNCTION public.get_flexoffers_sub_id(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  sub_id TEXT;
BEGIN
  SELECT sub_affiliate_id INTO sub_id
  FROM flexoffers_user_mapping
  WHERE user_id = user_id_param;
  
  RETURN sub_id;
END;
$$;
