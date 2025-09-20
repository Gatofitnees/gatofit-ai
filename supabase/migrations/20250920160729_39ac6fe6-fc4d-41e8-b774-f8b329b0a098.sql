-- Drop the conflicting policy and create a new comprehensive policy
DROP POLICY IF EXISTS "Allow users to view all exercises" ON routines;
DROP POLICY IF EXISTS "Todos pueden ver ejercicios" ON routines;
DROP POLICY IF EXISTS "Allow users to view all exercises" ON routines;

-- Create a new policy that allows everyone to view all routines
CREATE POLICY "Users can view all routines" 
ON routines 
FOR SELECT 
USING (true);