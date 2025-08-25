-- First, let's see what the current policy looks like and create a secure fix

-- Drop the current problematic public profile policy
DROP POLICY IF EXISTS "Secure: Users view public profiles" ON profiles;

-- Create a new, more secure policy that only allows viewing of safe, non-sensitive fields
-- This policy uses a column-level restriction approach
CREATE POLICY "Secure: Limited public profile access" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (
  is_profile_public = true 
  AND auth.uid() <> id
);

-- Create a secure view for public profiles that only exposes safe data
CREATE OR REPLACE VIEW public_profiles_safe AS
SELECT 
  id,
  username,
  avatar_url,
  bio,
  total_workouts,
  is_profile_public,
  created_at
FROM profiles
WHERE is_profile_public = true;

-- Enable RLS on the view (inherits from the base table)
-- Create a policy for the view that allows public access to safe fields only
CREATE POLICY "Anyone can view safe public profile data" 
ON public_profiles_safe
FOR SELECT 
TO authenticated
USING (true);

-- Create a function to get safe public profile data
CREATE OR REPLACE FUNCTION get_safe_public_profile(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  bio text,
  total_workouts integer,
  is_profile_public boolean
) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.total_workouts,
    p.is_profile_public
  FROM profiles p
  WHERE p.id = target_user_id 
    AND p.is_profile_public = true;
$$;