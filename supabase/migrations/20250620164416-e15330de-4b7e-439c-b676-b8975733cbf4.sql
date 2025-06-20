
-- First, let's create the necessary storage buckets for secure file uploads

-- Create avatars bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Create food-images bucket for nutrition photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('food-images', 'food-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Create exercise-media bucket for exercise content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('exercise-media', 'exercise-media', true, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

-- Set up RLS policies for avatars bucket
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;

CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up RLS policies for food-images bucket
DROP POLICY IF EXISTS "Users can upload their own food images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own food images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own food images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for food images" ON storage.objects;

CREATE POLICY "Public read access for food images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'food-images');

CREATE POLICY "Users can upload their own food images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own food images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own food images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up RLS policies for exercise-media bucket
DROP POLICY IF EXISTS "Users can upload their own exercise media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own exercise media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own exercise media" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for exercise media" ON storage.objects;

CREATE POLICY "Public read access for exercise media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exercise-media');

CREATE POLICY "Users can upload their own exercise media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exercise-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own exercise media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'exercise-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own exercise media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'exercise-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Clean up duplicate RLS policies on main tables
-- Note: We'll keep the most restrictive and clear policies, removing duplicates

-- Clean up profiles table policies (keeping essential ones)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Keep only these essential policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO public
USING (is_profile_public = true);

-- Clean up daily_food_log_entries policies
DROP POLICY IF EXISTS "Users can view own food entries" ON public.daily_food_log_entries;
DROP POLICY IF EXISTS "Users can insert own food entries" ON public.daily_food_log_entries;
DROP POLICY IF EXISTS "Users can update own food entries" ON public.daily_food_log_entries;
DROP POLICY IF EXISTS "Users can delete own food entries" ON public.daily_food_log_entries;

CREATE POLICY "Users can manage their own food entries"
ON public.daily_food_log_entries FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Clean up routines policies
DROP POLICY IF EXISTS "Users can view own routines" ON public.routines;
DROP POLICY IF EXISTS "Users can insert own routines" ON public.routines;
DROP POLICY IF EXISTS "Users can update own routines" ON public.routines;
DROP POLICY IF EXISTS "Users can delete own routines" ON public.routines;
DROP POLICY IF EXISTS "Public routines are viewable" ON public.routines;

CREATE POLICY "Users can manage their own routines"
ON public.routines FOR ALL
TO authenticated
USING (auth.uid() = user_id OR is_predefined = true)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public and predefined routines are viewable"
ON public.routines FOR SELECT
TO public
USING (is_predefined = true OR EXISTS (
  SELECT 1 FROM shared_routines 
  WHERE routine_id = routines.id AND is_public = true
));

-- Create a function to check user subscription status securely
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(plan_type::text, 'free')
  FROM user_subscriptions
  WHERE user_subscriptions.user_id = get_user_subscription_status.user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
$$;

-- Add rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL, -- IP address or email
  attempt_count integer DEFAULT 1,
  first_attempt_at timestamp with time zone DEFAULT now(),
  last_attempt_at timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier ON public.auth_rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked_until ON public.auth_rate_limits(blocked_until);

-- RLS for rate limiting table (only functions can access it)
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to rate limits"
ON public.auth_rate_limits FOR ALL
TO public
USING (false);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(p_identifier text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
