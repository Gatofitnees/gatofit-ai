-- Add policy to allow users to view routine exercises from assigned admin programs
CREATE POLICY "Users can view exercises from assigned admin program routines" 
ON routine_exercises 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM admin_program_routines apr
    JOIN user_assigned_programs uap ON apr.program_id = uap.program_id
    WHERE apr.routine_id = routine_exercises.routine_id 
    AND uap.user_id = auth.uid() 
    AND uap.is_active = true
  )
);