
-- Create the property_analyses table that matches what the admin components expect
CREATE TABLE public.property_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_address TEXT NOT NULL,
  total_monthly_revenue NUMERIC DEFAULT 0,
  total_opportunities INTEGER DEFAULT 0,
  property_type TEXT,
  is_active BOOLEAN DEFAULT true,
  coordinates JSONB,
  analysis_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the property_analyses table
CREATE POLICY "Users can view their own property analyses" 
  ON public.property_analyses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property analyses" 
  ON public.property_analyses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property analyses" 
  ON public.property_analyses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property analyses" 
  ON public.property_analyses FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_property_analyses_user_id ON public.property_analyses(user_id);
CREATE INDEX idx_property_analyses_is_active ON public.property_analyses(is_active);
CREATE INDEX idx_property_analyses_created_at ON public.property_analyses(created_at);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_property_analyses_updated_at 
  BEFORE UPDATE ON public.property_analyses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing data from user_property_analyses joined with user_addresses
INSERT INTO public.property_analyses (
  user_id,
  property_address,
  total_monthly_revenue,
  total_opportunities,
  property_type,
  is_active,
  coordinates,
  analysis_results,
  created_at,
  updated_at
)
SELECT 
  upa.user_id,
  ua.address as property_address,
  upa.total_monthly_revenue,
  upa.total_opportunities,
  upa.property_type,
  true as is_active, -- Default to active for existing analyses
  upa.coordinates,
  upa.analysis_results,
  upa.created_at,
  upa.updated_at
FROM user_property_analyses upa
JOIN user_addresses ua ON upa.address_id = ua.id;
