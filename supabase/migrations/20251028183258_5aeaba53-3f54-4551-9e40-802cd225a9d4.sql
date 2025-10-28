-- Permitir a usuarios autenticados leer el branding de su coach asignado
CREATE POLICY "Users can view their coach branding"
ON admin_users
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT coach_id 
    FROM coach_user_assignments 
    WHERE user_id = auth.uid()
  )
);