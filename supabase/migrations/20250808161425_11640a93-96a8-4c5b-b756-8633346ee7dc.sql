-- Política para permitir ver rutinas usadas en programas Gatofit activos
CREATE POLICY "Users can view routines used in active Gatofit programs" 
ON routines 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM gatofit_program_routines gpr
    JOIN gatofit_programs gp ON gpr.program_id = gp.id
    JOIN user_gatofit_program_progress ugpp ON gp.id = ugpp.program_id
    WHERE gpr.routine_id = routines.id 
      AND gp.is_active = true
      AND ugpp.user_id = auth.uid()
      AND ugpp.is_active = true
  )
);