-- Fix cancel_scheduled_plan_change to preserve paypal_subscription_id for cancellation
-- This allows frontend to cancel the PayPal subscription before clearing the scheduled change

CREATE OR REPLACE FUNCTION public.cancel_scheduled_plan_change(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result_json json;
  old_paypal_id text;
  old_plan_type text;
BEGIN
  -- First, get current subscription info including paypal_subscription_id
  SELECT 
    paypal_subscription_id,
    next_plan_type
  INTO 
    old_paypal_id,
    old_plan_type
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND next_plan_type IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No scheduled plan change found for user';
  END IF;

  -- Clear the scheduled change fields
  UPDATE user_subscriptions
  SET next_plan_type = NULL,
      next_plan_starts_at = NULL,
      scheduled_change_created_at = NULL,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Return subscription info with the old paypal_subscription_id that needs to be cancelled
  SELECT jsonb_build_object(
    'success', true,
    'paypal_subscription_id', old_paypal_id,
    'cancelled_plan_type', old_plan_type
  ) INTO result_json;
  
  RETURN result_json;
END;
$$;

COMMENT ON FUNCTION public.cancel_scheduled_plan_change IS 
'Cancels a scheduled plan change and returns the PayPal subscription ID that needs to be cancelled';