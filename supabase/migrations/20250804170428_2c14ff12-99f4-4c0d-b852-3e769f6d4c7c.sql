-- Fix function security by setting search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;