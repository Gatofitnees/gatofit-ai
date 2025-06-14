
-- Create function to schedule plan changes without losing paid time
CREATE OR REPLACE FUNCTION public.schedule_plan_change(
  p_user_id uuid,
  p_new_plan_type subscription_plan_type
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_subscription record;
  new_plan record;
  result_json json;
BEGIN
  -- Get current subscription
  SELECT * INTO current_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active subscription found for user';
  END IF;
  
  -- Get new plan details
  SELECT * INTO new_plan
  FROM subscription_plans
  WHERE plan_type = p_new_plan_type AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'New plan not found or not active';
  END IF;
  
  -- If changing from free to premium, apply immediately
  IF current_subscription.plan_type = 'free' THEN
    -- Calculate new expiration date
    UPDATE user_subscriptions
    SET plan_type = p_new_plan_type,
        expires_at = CASE 
          WHEN p_new_plan_type = 'monthly' THEN now() + interval '30 days'
          WHEN p_new_plan_type = 'yearly' THEN now() + interval '365 days'
          ELSE expires_at
        END,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Schedule the change for when current plan expires
    UPDATE user_subscriptions
    SET next_plan_type = p_new_plan_type,
        next_plan_starts_at = current_subscription.expires_at,
        scheduled_change_created_at = now(),
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Return updated subscription info
  SELECT row_to_json(us.*) INTO result_json
  FROM user_subscriptions us
  WHERE user_id = p_user_id;
  
  RETURN result_json;
END;
$$;

-- Create function to process scheduled plan changes
CREATE OR REPLACE FUNCTION public.process_scheduled_plan_changes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  subscription_record record;
  new_expiry_date timestamptz;
BEGIN
  -- Process all subscriptions where the scheduled change should happen
  FOR subscription_record IN
    SELECT *
    FROM user_subscriptions
    WHERE next_plan_type IS NOT NULL
      AND next_plan_starts_at IS NOT NULL
      AND next_plan_starts_at <= now()
      AND status = 'active'
  LOOP
    -- Calculate new expiry date based on the new plan
    new_expiry_date := CASE
      WHEN subscription_record.next_plan_type = 'monthly' THEN
        subscription_record.next_plan_starts_at + interval '30 days'
      WHEN subscription_record.next_plan_type = 'yearly' THEN
        subscription_record.next_plan_starts_at + interval '365 days'
      WHEN subscription_record.next_plan_type = 'free' THEN
        NULL
    END;
    
    -- Update the subscription with the new plan
    UPDATE user_subscriptions
    SET plan_type = subscription_record.next_plan_type,
        expires_at = new_expiry_date,
        started_at = subscription_record.next_plan_starts_at,
        next_plan_type = NULL,
        next_plan_starts_at = NULL,
        scheduled_change_created_at = NULL,
        status = CASE WHEN subscription_record.next_plan_type = 'free' THEN 'active' ELSE 'active' END,
        updated_at = now()
    WHERE id = subscription_record.id;
    
    -- Log the change (optional - you can add logging table if needed)
    RAISE NOTICE 'Processed scheduled plan change for user % from % to %', 
      subscription_record.user_id, 
      subscription_record.plan_type, 
      subscription_record.next_plan_type;
  END LOOP;
END;
$$;

-- Create function to cancel scheduled plan change
CREATE OR REPLACE FUNCTION public.cancel_scheduled_plan_change(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result_json json;
BEGIN
  UPDATE user_subscriptions
  SET next_plan_type = NULL,
      next_plan_starts_at = NULL,
      scheduled_change_created_at = NULL,
      updated_at = now()
  WHERE user_id = p_user_id
    AND next_plan_type IS NOT NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No scheduled plan change found for user';
  END IF;
  
  -- Return updated subscription info
  SELECT row_to_json(us.*) INTO result_json
  FROM user_subscriptions us
  WHERE user_id = p_user_id;
  
  RETURN result_json;
END;
$$;
