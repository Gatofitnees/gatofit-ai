-- Create a function to get routine details bypassing RLS if needed
CREATE OR REPLACE FUNCTION public.get_routine_details(routine_ids integer[])
RETURNS TABLE(id integer, name text, type text, estimated_duration_minutes integer, description text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT r.id, r.name, r.type, r.estimated_duration_minutes, r.description
  FROM routines r
  WHERE r.id = ANY(routine_ids);
$$;