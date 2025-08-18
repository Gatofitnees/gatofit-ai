-- Security Fix: Remove insecure RLS policies and create secure ones (handling existing policies)

-- 1. DROP all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Allow viewing public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles públicos" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles of authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view and edit own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;

-- 2. DROP insecure policy on user_follows table  
DROP POLICY IF EXISTS "Users can view all follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can view follows they are involved in" ON public.user_follows;
DROP POLICY IF EXISTS "Users can create follows for themselves" ON public.user_follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON public.user_follows;

-- 3. Create NEW secure RLS policies for profiles table
CREATE POLICY "Secure: Users view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Secure: Users view public profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_profile_public = true AND auth.uid() != id);

CREATE POLICY "Secure: Users update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Secure: Users insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Secure: Users delete own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = id);

-- 4. Create NEW secure RLS policies for user_follows table
CREATE POLICY "Secure: Users view own follows" 
ON public.user_follows 
FOR SELECT 
TO authenticated
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Secure: Users create own follows" 
ON public.user_follows 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Secure: Users delete own follows" 
ON public.user_follows 
FOR DELETE 
TO authenticated
USING (auth.uid() = follower_id);