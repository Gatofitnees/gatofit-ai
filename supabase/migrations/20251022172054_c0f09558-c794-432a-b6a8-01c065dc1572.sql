-- Create table for PayPal webhook events auditing
CREATE TABLE IF NOT EXISTS public.paypal_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_paypal_webhook_events_event_id ON public.paypal_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_paypal_webhook_events_resource_id ON public.paypal_webhook_events(resource_id);
CREATE INDEX IF NOT EXISTS idx_paypal_webhook_events_event_type ON public.paypal_webhook_events(event_type);

-- Enable RLS
ALTER TABLE public.paypal_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook events (for security and auditing)
CREATE POLICY "Service role can manage webhook events"
  ON public.paypal_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
