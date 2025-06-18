
-- Función para asegurar que un usuario tenga una suscripción
CREATE OR REPLACE FUNCTION ensure_user_subscription(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_type, status)
  VALUES (p_user_id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Crear suscripciones para usuarios existentes que no tengan una
INSERT INTO public.user_subscriptions (user_id, plan_type, status)
SELECT p.id, 'free', 'active'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_subscriptions us 
  WHERE us.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Actualizar el trigger existente para asegurar suscripción en nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;

CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Asegurar que tenga perfil
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Asegurar que tenga suscripción
  INSERT INTO public.user_subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();
