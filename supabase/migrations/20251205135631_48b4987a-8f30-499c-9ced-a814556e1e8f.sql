-- ==============================================
-- Restaurar Políticas RLS Anteriores de Routines
-- ==============================================

-- Paso 1: Eliminar la nueva política consolidada
DROP POLICY IF EXISTS "secure_routine_access" ON routines;

-- Paso 2: Restaurar todas las políticas SELECT anteriores
CREATE POLICY "Users can view all routines" ON routines
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view their own routines" ON routines
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden ver sus propias rutinas" ON routines
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Los usuarios pueden ver sus rutinas, predefinidas y públicas" ON routines
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR is_predefined = true 
  OR EXISTS (
    SELECT 1 FROM shared_routines 
    WHERE shared_routines.routine_id = routines.id 
    AND shared_routines.is_public = true
  )
);

CREATE POLICY "Allow viewing routines for public sharing" ON routines
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shared_routines
    WHERE shared_routines.routine_id = routines.id
    AND shared_routines.is_public = true
  )
);

CREATE POLICY "Public and predefined routines are viewable" ON routines
FOR SELECT
TO authenticated
USING (is_predefined = true);

CREATE POLICY "Users can view routines from assigned admin programs" ON routines
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_program_routines apr
    JOIN user_assigned_programs uap ON apr.program_id = uap.program_id
    WHERE apr.routine_id = routines.id
    AND uap.user_id = auth.uid()
    AND uap.is_active = true
  )
);

CREATE POLICY "Users can view routines used in active Gatofit programs" ON routines
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM gatofit_program_routines gpr
    JOIN gatofit_programs gp ON gpr.program_id = gp.id
    WHERE gpr.routine_id = routines.id
    AND gp.is_active = true
  )
);

-- Paso 3: Restaurar la política ALL para gestión de rutinas propias
CREATE POLICY "Users can manage their own routines" ON routines
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());