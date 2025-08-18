-- Security Fix: Remove insecure RLS policies and create secure ones

-- 1. DROP all existing insecure policies on profiles table
DROP POLICY IF EXISTS "Allow viewing public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles públicos" ON public.profiles;

-- 2. DROP insecure policy on user_follows table  
DROP POLICY IF EXISTS "Users can view all follows" ON public.user_follows;

-- 3. Create secure RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles of authenticated users only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_profile_public = true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = id);

-- 4. Create secure RLS policies for user_follows table
CREATE POLICY "Users can view follows they are involved in" 
ON public.user_follows 
FOR SELECT 
TO authenticated
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create follows for themselves" 
ON public.user_follows 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" 
ON public.user_follows 
FOR DELETE 
TO authenticated
USING (auth.uid() = follower_id);

-- 5. Create secure RLS policies for user_streaks table (if it exists)
CREATE POLICY "Users can view their own streaks" 
ON public.user_streaks 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
ON public.user_streaks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" 
ON public.user_streaks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. Fix database functions with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_macro_recommendations(user_weight_kg numeric, user_height_cm numeric, user_age integer, user_gender text, user_goal text, user_trainings_per_week integer, user_target_pace text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION public.get_week_start(input_date date DEFAULT CURRENT_DATE)
 RETURNS date
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
SELECT (input_date - ((EXTRACT(DOW FROM input_date)::INTEGER + 6) % 7) * INTERVAL '1 day')::DATE;
$function$;