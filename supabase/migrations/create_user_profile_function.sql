
-- Create a function to safely create user profiles, bypassing RLS
CREATE OR REPLACE FUNCTION public.create_user_profile(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
