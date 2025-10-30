-- Create support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (char_length(subject) >= 3 AND char_length(subject) <= 100),
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 5000),
  category TEXT NOT NULL CHECK (category IN ('bug', 'suggestion', 'question', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create support ticket attachments table
CREATE TABLE IF NOT EXISTS public.support_ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760), -- Max 10MB
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_ticket_attachments_ticket_id ON public.support_ticket_attachments(ticket_id);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can insert their own tickets"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can update ticket status"
  ON public.support_tickets
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete tickets"
  ON public.support_tickets
  FOR DELETE
  USING (is_admin());

-- RLS Policies for support_ticket_attachments
CREATE POLICY "Users can insert attachments for their own tickets"
  ON public.support_ticket_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view attachments for their own tickets"
  ON public.support_ticket_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND (user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Admins can delete attachments"
  ON public.support_ticket_attachments
  FOR DELETE
  USING (is_admin());

-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for support-attachments bucket
CREATE POLICY "Users can upload their own support attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'support-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own support attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'support-attachments'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
  );

CREATE POLICY "Public can view support attachments"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'support-attachments');

CREATE POLICY "Admins can delete support attachments"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'support-attachments' AND is_admin());

-- Create trigger to update updated_at on support_tickets
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();