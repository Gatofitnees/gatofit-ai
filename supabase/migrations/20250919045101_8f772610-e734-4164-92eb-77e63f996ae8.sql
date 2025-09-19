-- Update the is_user_premium function to include 'asesorados' users as premium
CREATE OR REPLACE FUNCTION public.is_user_premium(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_subscriptions 
    WHERE user_subscriptions.user_id = is_user_premium.user_id
      AND plan_type IN ('monthly', 'yearly', 'asesorados')
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$function$