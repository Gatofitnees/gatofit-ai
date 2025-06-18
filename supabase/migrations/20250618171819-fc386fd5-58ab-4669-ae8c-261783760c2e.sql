
-- Primero hacer DROP de la función existente y recrearla con parámetro correcto
DROP FUNCTION IF EXISTS public.increment_usage_counter(uuid, text, integer);

CREATE OR REPLACE FUNCTION public.increment_usage_counter(p_user_id uuid, counter_type text, increment_by integer DEFAULT 1)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  week_start DATE := get_week_start();
BEGIN
  -- Insert or update usage record
  INSERT INTO public.usage_limits (user_id, week_start_date, routines_created, nutrition_photos_used, ai_chat_messages_used)
  VALUES (
    p_user_id, 
    week_start,
    CASE WHEN counter_type = 'routines' THEN increment_by ELSE 0 END,
    CASE WHEN counter_type = 'nutrition_photos' THEN increment_by ELSE 0 END,
    CASE WHEN counter_type = 'ai_chat_messages' THEN increment_by ELSE 0 END
  )
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    routines_created = CASE WHEN counter_type = 'routines' THEN usage_limits.routines_created + increment_by ELSE usage_limits.routines_created END,
    nutrition_photos_used = CASE WHEN counter_type = 'nutrition_photos' THEN usage_limits.nutrition_photos_used + increment_by ELSE usage_limits.nutrition_photos_used END,
    ai_chat_messages_used = CASE WHEN counter_type = 'ai_chat_messages' THEN usage_limits.ai_chat_messages_used + increment_by ELSE usage_limits.ai_chat_messages_used END,
    updated_at = now();
    
  RETURN true;
END;
$function$
