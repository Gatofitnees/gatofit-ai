
-- Fix search_path warnings by updating remaining database functions with proper search_path configuration

-- Update increment_usage_counter function with explicit search_path
CREATE OR REPLACE FUNCTION public.increment_usage_counter(p_user_id uuid, counter_type text, increment_by integer DEFAULT 1)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  week_start DATE := get_week_start();
BEGIN
  -- Insert or update usage record
  INSERT INTO public.usage_limits (user_id, week_start_date, routines_created, nutrition_photos_used, ai_chat_messages_used)
  VALUES (
    p_user_id, 
    week_start,
    CASE WHEN counter_type = 'routines' THEN increment_by ELSE 0 END,
    CASE WHEN counter_type = 'nutrition_photos' THEN increment_by ELSE 0 END,
    CASE WHEN counter_type = 'ai_chat_messages' THEN increment_by ELSE 0 END
  )
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    routines_created = CASE WHEN counter_type = 'routines' THEN usage_limits.routines_created + increment_by ELSE usage_limits.routines_created END,
    nutrition_photos_used = CASE WHEN counter_type = 'nutrition_photos' THEN usage_limits.nutrition_photos_used + increment_by ELSE usage_limits.nutrition_photos_used END,
    ai_chat_messages_used = CASE WHEN counter_type = 'ai_chat_messages' THEN usage_limits.ai_chat_messages_used + increment_by ELSE usage_limits.ai_chat_messages_used END,
    updated_at = now();
    
  RETURN true;
END;
$function$;

-- Update update_user_streak function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  last_activity DATE;
  current_streak_count INTEGER;
  has_food_today BOOLEAN := FALSE;
  has_workout_today BOOLEAN := FALSE;
  current_xp INTEGER;
  current_lvl INTEGER;
  xp_today INTEGER;
  workouts_today_count INTEGER;
  foods_today_count INTEGER;
  last_xp_date_val DATE;
  new_xp INTEGER := 0;
  foods_logged_today INTEGER;
BEGIN
  -- Check if user has food entries today
  SELECT EXISTS(
    SELECT 1 FROM daily_food_log_entries 
    WHERE user_id = p_user_id AND log_date = CURRENT_DATE
  ) INTO has_food_today;
  
  -- Check if user has workout entries today
  SELECT EXISTS(
    SELECT 1 FROM workout_logs 
    WHERE user_id = p_user_id AND DATE(workout_date) = CURRENT_DATE
  ) INTO has_workout_today;
  
  -- If no activity today, don't update
  IF NOT (has_food_today OR has_workout_today) THEN
    RETURN;
  END IF;
  
  -- Get current streak data
  SELECT last_activity_date, current_streak, total_experience, current_level, 
         experience_today, workouts_today, foods_today, last_xp_date
  INTO last_activity, current_streak_count, current_xp, current_lvl,
       xp_today, workouts_today_count, foods_today_count, last_xp_date_val
  FROM user_streaks 
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    -- Calculate initial XP for today
    IF has_workout_today THEN
      new_xp := new_xp + 25;
      workouts_today_count := 1;
    END IF;
    
    IF has_food_today THEN
      SELECT COUNT(*) INTO foods_logged_today
      FROM daily_food_log_entries 
      WHERE user_id = p_user_id AND log_date = CURRENT_DATE;
      
      foods_logged_today := LEAST(foods_logged_today, 3);
      new_xp := new_xp + (foods_logged_today * 10);
      foods_today_count := foods_logged_today;
    END IF;
    
    INSERT INTO user_streaks (
      user_id, current_streak, last_activity_date, total_points, 
      total_experience, current_level, experience_today, workouts_today, 
      foods_today, last_xp_date
    )
    VALUES (
      p_user_id, 1, CURRENT_DATE, 1, 
      new_xp, ((new_xp / 100) + 1), new_xp, workouts_today_count, 
      foods_today_count, CURRENT_DATE
    );
    RETURN;
  END IF;
  
  -- Reset daily counters if it's a new day
  IF last_xp_date_val != CURRENT_DATE THEN
    xp_today := 0;
    workouts_today_count := 0;
    foods_today_count := 0;
  END IF;
  
  -- Calculate XP to add
  IF has_workout_today AND workouts_today_count = 0 THEN
    new_xp := new_xp + 25;
    workouts_today_count := 1;
  END IF;
  
  IF has_food_today THEN
    SELECT COUNT(*) INTO foods_logged_today
    FROM daily_food_log_entries 
    WHERE user_id = p_user_id AND log_date = CURRENT_DATE;
    
    foods_logged_today := LEAST(foods_logged_today, 3);
    IF foods_logged_today > foods_today_count THEN
      new_xp := new_xp + ((foods_logged_today - foods_today_count) * 10);
      foods_today_count := foods_logged_today;
    END IF;
  END IF;
  
  -- Update experience and calculate new level
  current_xp := current_xp + new_xp;
  current_lvl := (current_xp / 100) + 1;
  xp_today := xp_today + new_xp;
  
  -- Update streak logic
  IF last_activity = CURRENT_DATE THEN
    -- Already counted today, just update XP
    UPDATE user_streaks 
    SET total_experience = current_xp,
        current_level = current_lvl,
        experience_today = xp_today,
        workouts_today = workouts_today_count,
        foods_today = foods_today_count,
        last_xp_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSIF last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE user_streaks 
    SET current_streak = current_streak + 1,
        total_points = total_points + 1,
        last_activity_date = CURRENT_DATE,
        total_experience = current_xp,
        current_level = current_lvl,
        experience_today = xp_today,
        workouts_today = workouts_today_count,
        foods_today = foods_today_count,
        last_xp_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Reset streak
    UPDATE user_streaks 
    SET current_streak = 1,
        total_points = total_points + 1,
        last_activity_date = CURRENT_DATE,
        total_experience = current_xp,
        current_level = current_lvl,
        experience_today = xp_today,
        workouts_today = workouts_today_count,
        foods_today = foods_today_count,
        last_xp_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$function$;

-- Update schedule_plan_change function with explicit search_path
CREATE OR REPLACE FUNCTION public.schedule_plan_change(p_user_id uuid, p_new_plan_type subscription_plan_type)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update cancel_scheduled_plan_change function with explicit search_path
CREATE OR REPLACE FUNCTION public.cancel_scheduled_plan_change(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;
