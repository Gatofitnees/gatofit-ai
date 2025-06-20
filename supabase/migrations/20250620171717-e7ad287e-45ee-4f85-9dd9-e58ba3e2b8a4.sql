
-- Fix search_path warnings by updating database functions with proper search_path configuration

-- Update get_user_subscription_status function
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(plan_type::text, 'free')
  FROM user_subscriptions
  WHERE user_subscriptions.user_id = get_user_subscription_status.user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
$function$;

-- Update is_user_premium function
CREATE OR REPLACE FUNCTION public.is_user_premium(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_subscriptions 
    WHERE user_subscriptions.user_id = is_user_premium.user_id
      AND plan_type IN ('monthly', 'yearly')
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$function$;

-- Update get_public_routines function
CREATE OR REPLACE FUNCTION public.get_public_routines(target_user_id uuid)
 RETURNS TABLE(routine_id integer, routine_name text, routine_type text, routine_description text, estimated_duration_minutes integer, exercise_count bigint, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as routine_id,
    r.name as routine_name,
    r.type as routine_type,
    r.description as routine_description,
    r.estimated_duration_minutes,
    COUNT(re.exercise_id) as exercise_count,
    r.created_at
  FROM routines r
  INNER JOIN shared_routines sr ON r.id = sr.routine_id
  LEFT JOIN routine_exercises re ON r.id = re.routine_id
  WHERE sr.user_id = target_user_id 
    AND sr.is_public = true
  GROUP BY r.id, r.name, r.type, r.description, r.estimated_duration_minutes, r.created_at
  ORDER BY r.created_at DESC;
END;
$function$;

-- Update copy_routine function
CREATE OR REPLACE FUNCTION public.copy_routine(source_routine_id integer, target_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  new_routine_id integer;
  routine_data record;
  exercise_data record;
  result_json json;
BEGIN
  -- Get the source routine data
  SELECT id, name, type, description, estimated_duration_minutes
  INTO routine_data
  FROM routines
  WHERE id = source_routine_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Routine not found';
  END IF;
  
  -- Check if this routine is actually public
  IF NOT EXISTS (
    SELECT 1 FROM shared_routines 
    WHERE routine_id = source_routine_id AND is_public = true
  ) THEN
    RAISE EXCEPTION 'Routine is not public';
  END IF;
  
  -- Create the new routine
  INSERT INTO routines (
    name, 
    type, 
    description, 
    estimated_duration_minutes, 
    user_id, 
    is_predefined
  )
  VALUES (
    routine_data.name || ' (Copia)',
    routine_data.type,
    routine_data.description,
    routine_data.estimated_duration_minutes,
    target_user_id,
    false
  )
  RETURNING id INTO new_routine_id;
  
  -- Copy all routine exercises
  FOR exercise_data IN 
    SELECT * FROM routine_exercises 
    WHERE routine_id = source_routine_id 
    ORDER BY exercise_order
  LOOP
    INSERT INTO routine_exercises (
      routine_id,
      exercise_id,
      exercise_order,
      sets,
      reps_min,
      reps_max,
      rest_between_sets_seconds,
      duration_seconds,
      block_name,
      notes
    )
    VALUES (
      new_routine_id,
      exercise_data.exercise_id,
      exercise_data.exercise_order,
      exercise_data.sets,
      exercise_data.reps_min,
      exercise_data.reps_max,
      exercise_data.rest_between_sets_seconds,
      exercise_data.duration_seconds,
      exercise_data.block_name,
      exercise_data.notes
    );
  END LOOP;
  
  -- Return the new routine info
  SELECT row_to_json(r.*) INTO result_json
  FROM routines r
  WHERE r.id = new_routine_id;
  
  RETURN result_json;
END;
$function$;

-- Update get_user_weekly_usage function
CREATE OR REPLACE FUNCTION public.get_user_weekly_usage(user_id uuid)
 RETURNS TABLE(routines_created integer, nutrition_photos_used integer, ai_chat_messages_used integer, week_start_date date)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT 
    COALESCE(ul.routines_created, 0)::INTEGER,
    COALESCE(ul.nutrition_photos_used, 0)::INTEGER,
    COALESCE(ul.ai_chat_messages_used, 0)::INTEGER,
    get_week_start()
  FROM public.usage_limits ul
  WHERE ul.user_id = get_user_weekly_usage.user_id
    AND ul.week_start_date = get_week_start()
  UNION ALL
  SELECT 0, 0, 0, get_week_start()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.usage_limits ul2
    WHERE ul2.user_id = get_user_weekly_usage.user_id
      AND ul2.week_start_date = get_week_start()
  )
  LIMIT 1;
$function$;

-- Update check_auth_rate_limit function
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(p_identifier text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  current_attempts integer := 0;
  block_duration interval := interval '15 minutes';
BEGIN
  -- Clean up old entries
  DELETE FROM auth_rate_limits 
  WHERE first_attempt_at < now() - interval '1 hour';
  
  -- Check if currently blocked
  SELECT attempt_count INTO current_attempts
  FROM auth_rate_limits
  WHERE identifier = p_identifier
    AND (blocked_until IS NULL OR blocked_until > now())
    AND first_attempt_at > now() - (p_window_minutes || ' minutes')::interval;
  
  -- If blocked, return false
  IF current_attempts >= p_max_attempts THEN
    RETURN false;
  END IF;
  
  -- Update or insert attempt record
  INSERT INTO auth_rate_limits (identifier, attempt_count, first_attempt_at, last_attempt_at)
  VALUES (p_identifier, 1, now(), now())
  ON CONFLICT (identifier) DO UPDATE SET
    attempt_count = CASE 
      WHEN auth_rate_limits.first_attempt_at < now() - (p_window_minutes || ' minutes')::interval 
      THEN 1 
      ELSE auth_rate_limits.attempt_count + 1 
    END,
    first_attempt_at = CASE 
      WHEN auth_rate_limits.first_attempt_at < now() - (p_window_minutes || ' minutes')::interval 
      THEN now() 
      ELSE auth_rate_limits.first_attempt_at 
    END,
    last_attempt_at = now(),
    blocked_until = CASE 
      WHEN auth_rate_limits.attempt_count + 1 >= p_max_attempts 
      THEN now() + block_duration 
      ELSE auth_rate_limits.blocked_until 
    END;
  
  -- Return true if under limit
  RETURN (current_attempts + 1) < p_max_attempts;
END;
$function$;

-- Update calculate_macro_recommendations function
CREATE OR REPLACE FUNCTION public.calculate_macro_recommendations(user_weight_kg numeric, user_height_cm numeric, user_age integer, user_gender text, user_goal text, user_trainings_per_week integer, user_target_pace text)
 RETURNS json
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  bmr NUMERIC;
  tdee NUMERIC;
  calorie_target INTEGER;
  protein_target INTEGER;
  carb_target INTEGER;
  fat_target INTEGER;
  activity_multiplier NUMERIC := 1.2; -- sedentary base
  goal_modifier NUMERIC := 1.0;
BEGIN
  -- Calculate BMR using Mifflin-St Jeor Equation
  IF user_gender = 'male' THEN
    bmr := (10 * user_weight_kg) + (6.25 * user_height_cm) - (5 * user_age) + 5;
  ELSE
    bmr := (10 * user_weight_kg) + (6.25 * user_height_cm) - (5 * user_age) - 161;
  END IF;
  
  -- Adjust activity multiplier based on training frequency
  IF user_trainings_per_week >= 6 THEN
    activity_multiplier := 1.725; -- very active
  ELSIF user_trainings_per_week >= 4 THEN
    activity_multiplier := 1.55; -- moderately active
  ELSIF user_trainings_per_week >= 1 THEN
    activity_multiplier := 1.375; -- lightly active
  END IF;
  
  -- Calculate TDEE
  tdee := bmr * activity_multiplier;
  
  -- Adjust calories based on goal and pace
  CASE user_goal
    WHEN 'lose_weight' THEN
      CASE user_target_pace
        WHEN 'fast' THEN goal_modifier := 0.75;
        WHEN 'moderate' THEN goal_modifier := 0.85;
        WHEN 'slow' THEN goal_modifier := 0.92;
        ELSE goal_modifier := 0.85;
      END CASE;
    WHEN 'gain_weight', 'build_muscle' THEN
      CASE user_target_pace
        WHEN 'fast' THEN goal_modifier := 1.25;
        WHEN 'moderate' THEN goal_modifier := 1.15;
        WHEN 'slow' THEN goal_modifier := 1.08;
        ELSE goal_modifier := 1.15;
      END CASE;
    WHEN 'maintain_weight', 'improve_health', 'increase_strength' THEN
      goal_modifier := 1.0;
  END CASE;
  
  calorie_target := ROUND(tdee * goal_modifier);
  
  -- Calculate macros (protein: 1.6-2.2g/kg, fat: 20-35% calories, carbs: remainder)
  protein_target := ROUND(user_weight_kg * 2.0); -- 2g per kg for active individuals
  fat_target := ROUND((calorie_target * 0.25) / 9); -- 25% of calories from fat
  carb_target := ROUND((calorie_target - (protein_target * 4) - (fat_target * 9)) / 4);
  
  -- Ensure minimums
  IF protein_target < 100 THEN protein_target := 100; END IF;
  IF fat_target < 50 THEN fat_target := 50; END IF;
  IF carb_target < 100 THEN carb_target := 100; END IF;
  
  RETURN json_build_object(
    'calories', calorie_target,
    'protein_g', protein_target,
    'carbs_g', carb_target,
    'fats_g', fat_target
  );
END;
$function$;

-- Update ensure_user_subscription function
CREATE OR REPLACE FUNCTION public.ensure_user_subscription(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_type, status)
  VALUES (p_user_id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
END;
$function$;
