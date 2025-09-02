-- Fix search_path issues for existing functions
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = user_id AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.create_user_profile(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;