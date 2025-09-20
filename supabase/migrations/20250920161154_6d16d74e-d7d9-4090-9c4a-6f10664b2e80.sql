-- Add policy to allow users to view routines assigned to them via admin programs
CREATE POLICY "Users can view routines from assigned admin programs" 
ON routines 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM admin_program_routines apr
    JOIN user_assigned_programs uap ON apr.program_id = uap.program_id
    WHERE apr.routine_id = routines.id 
    AND uap.user_id = auth.uid() 
    AND uap.is_active = true
  )
);