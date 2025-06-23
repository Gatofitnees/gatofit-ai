
-- Create body_measurements_history table to track weight and body measurements over time
CREATE TABLE public.body_measurements_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg NUMERIC,
  body_fat_percentage NUMERIC,
  chest_circumference_cm NUMERIC,
  leg_circumference_cm NUMERIC,
  abdomen_circumference_cm NUMERIC,
  arm_circumference_cm NUMERIC,
  height_cm NUMERIC,
  notes TEXT,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.body_measurements_history ENABLE ROW LEVEL SECURITY;

-- Create policies for body measurements history
CREATE POLICY "Users can view their own body measurements history" 
  ON public.body_measurements_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body measurements history" 
  ON public.body_measurements_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body measurements history" 
  ON public.body_measurements_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body measurements history" 
  ON public.body_measurements_history 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_body_measurements_history_user_date ON public.body_measurements_history(user_id, measured_at DESC);
