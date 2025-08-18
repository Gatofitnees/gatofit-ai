-- Fix RLS policies for routine_exercises to allow access to Gatofit program routines

-- Drop existing policies on routine_exercises that might be blocking access
DROP POLICY IF EXISTS "Users can view their own routine exercises" ON public.routine_exercises;
DROP POLICY IF EXISTS "Users can modify their own routine exercises" ON public.routine_exercises;
DROP POLICY IF EXISTS "Users can delete their own routine exercises" ON public.routine_exercises;
DROP POLICY IF EXISTS "Users can insert their own routine exercises" ON public.routine_exercises;

-- Create secure policies for routine_exercises
-- Allow users to view exercises from their own routines
CREATE POLICY "Users can view own routine exercises"
ON public.routine_exercises
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM routines r 
    WHERE r.id = routine_exercises.routine_id 
    AND r.user_id = auth.uid()
  )
);

-- Allow users to view exercises from Gatofit program routines they have active
CREATE POLICY "Users can view Gatofit program routine exercises"
ON public.routine_exercises  
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_gatofit_program_progress ugpp
    JOIN gatofit_program_routines gpr ON gpr.program_id = ugpp.program_id
    WHERE ugpp.user_id = auth.uid()
    AND ugpp.is_active = true
    AND gpr.routine_id = routine_exercises.routine_id
  )
);

-- Allow users to insert/update/delete their own routine exercises
CREATE POLICY "Users can insert own routine exercises"
ON public.routine_exercises
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM routines r 
    WHERE r.id = routine_exercises.routine_id 
    AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own routine exercises"
ON public.routine_exercises
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM routines r 
    WHERE r.id = routine_exercises.routine_id 
    AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own routine exercises"
ON public.routine_exercises
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM routines r 
    WHERE r.id = routine_exercises.routine_id 
    AND r.user_id = auth.uid()
  )
);