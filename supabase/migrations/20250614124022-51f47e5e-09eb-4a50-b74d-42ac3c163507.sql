
-- Add columns to user_subscriptions table to support scheduled plan changes
ALTER TABLE public.user_subscriptions 
ADD COLUMN next_plan_type subscription_plan_type,
ADD COLUMN next_plan_starts_at TIMESTAMPTZ,
ADD COLUMN scheduled_change_created_at TIMESTAMPTZ;

-- Create index for efficient querying of scheduled changes
CREATE INDEX idx_user_subscriptions_next_plan_starts_at 
ON public.user_subscriptions(next_plan_starts_at) 
WHERE next_plan_starts_at IS NOT NULL;

-- Function to process scheduled plan changes
CREATE OR REPLACE FUNCTION process_scheduled_plan_changes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET 
    plan_type = next_plan_type,
    next_plan_type = NULL,
    next_plan_starts_at = NULL,
    scheduled_change_created_at = NULL,
    updated_at = now()
  WHERE next_plan_starts_at IS NOT NULL
    AND next_plan_starts_at <= now()
    AND status = 'active';
END;
$$;
