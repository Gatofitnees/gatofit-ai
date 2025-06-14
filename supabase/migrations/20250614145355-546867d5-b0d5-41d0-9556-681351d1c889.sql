
-- Fix search_path warnings by updating database functions with proper search_path configuration

-- Update create_user_profile function with proper search_path
CREATE OR REPLACE FUNCTION public.create_user_profile(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  profile_record json;
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (user_id)
  RETURNING row_to_json(profiles) INTO profile_record;
  
  RETURN profile_record;
EXCEPTION WHEN unique_violation THEN
  -- If profile already exists, just return it
  SELECT row_to_json(profiles) INTO profile_record
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN profile_record;
END;
$$;

-- Update get_user_stats function with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id uuid)
RETURNS TABLE(total_workouts bigint, followers_count bigint, following_count bigint, total_workout_hours numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM workout_logs WHERE user_id = target_user_id) as total_workouts,
    (SELECT COUNT(*) FROM user_follows WHERE following_id = target_user_id) as followers_count,
    (SELECT COUNT(*) FROM user_follows WHERE follower_id = target_user_id) as following_count,
    (SELECT COALESCE(SUM(duration_completed_minutes), 0) / 60.0 FROM workout_logs WHERE user_id = target_user_id) as total_workout_hours;
END;
$$;

-- Update update_user_streak function with proper search_path
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
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
$$;

-- Clean up obsolete function versions that may be causing conflicts
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_macro_recommendations() CASCADE;
DROP FUNCTION IF EXISTS public.copy_routine() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_stats() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_streak() CASCADE;
DROP FUNCTION IF EXISTS public.is_user_premium(bigint) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_streak(uuid, integer) CASCADE;
