-- ==============================================
-- Fix Routines Table RLS Policies
-- Remove dangerous and duplicate SELECT policies
-- Create one secure, consolidated policy
-- ==============================================

-- Phase 1: Remove all problematic SELECT policies
DROP POLICY IF EXISTS "Users can view all routines" ON routines;
DROP POLICY IF EXISTS "Users can view their own routines" ON routines;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias rutinas" ON routines;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus rutinas, predefinidas y públicas" ON routines;
DROP POLICY IF EXISTS "Allow viewing routines for public sharing" ON routines;
DROP POLICY IF EXISTS "Public and predefined routines are viewable" ON routines;
DROP POLICY IF EXISTS "Users can view routines from assigned admin programs" ON routines;
DROP POLICY IF EXISTS "Users can view routines used in active Gatofit programs" ON routines;
DROP POLICY IF EXISTS "Users can manage their own routines" ON routines;

-- Phase 2: Create ONE clean, comprehensive SELECT policy
CREATE POLICY "secure_routine_access" ON routines
FOR SELECT
TO authenticated
USING (
  -- User owns the routine
  user_id = auth.uid()
  -- Predefined system routines
  OR is_predefined = true
  -- Publicly shared routines
  OR EXISTS (
    SELECT 1 FROM shared_routines
    WHERE shared_routines.routine_id = routines.id
    AND shared_routines.is_public = true
  )
  -- Routines from enrolled Gatofit programs
  OR EXISTS (
    SELECT 1 
    FROM gatofit_program_routines gpr
    JOIN gatofit_programs gp ON gpr.program_id = gp.id
    JOIN user_gatofit_program_progress ugpp ON gp.id = ugpp.program_id
    WHERE gpr.routine_id = routines.id
    AND gp.is_active = true
    AND ugpp.user_id = auth.uid()
    AND ugpp.is_active = true
  )
  -- Routines from assigned admin programs
  OR EXISTS (
    SELECT 1 
    FROM admin_program_routines apr
    JOIN user_assigned_programs uap ON apr.program_id = uap.program_id
    WHERE apr.routine_id = routines.id
    AND uap.user_id = auth.uid()
    AND uap.is_active = true
  )
);