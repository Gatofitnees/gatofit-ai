
-- Create subscription plan types enum
CREATE TYPE public.subscription_plan_type AS ENUM ('free', 'monthly', 'yearly');

-- Create subscription status enum  
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending', 'trial');

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type subscription_plan_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type subscription_plan_type NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  store_transaction_id TEXT, -- For Play Store/App Store verification
  store_platform TEXT, -- 'google_play', 'app_store', 'web'
  auto_renewal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id) -- One active subscription per user
);

-- Create usage limits tracking table
CREATE TABLE public.usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL, -- Monday of the week
  routines_created INTEGER DEFAULT 0,
  nutrition_photos_used INTEGER DEFAULT 0,
  ai_chat_messages_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans"
ON public.subscription_plans FOR SELECT
TO public
USING (is_active = true);

-- RLS Policies for user_subscriptions (users can only see their own)
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for usage_limits (users can only see their own)
CREATE POLICY "Users can view their own usage limits"
ON public.usage_limits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage limits"
ON public.usage_limits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage limits"
ON public.usage_limits FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_type, name, price_usd, duration_days, features) VALUES
('free', 'Plan Gratuito', 0.00, 0, '{"routines_limit": 4, "nutrition_photos_weekly": 10, "ai_chat_messages_weekly": 5}'),
('monthly', 'Plan Mensual Premium', 6.50, 30, '{"routines_limit": -1, "nutrition_photos_weekly": -1, "ai_chat_messages_weekly": -1}'),
('yearly', 'Plan Anual Premium', 30.00, 365, '{"routines_limit": -1, "nutrition_photos_weekly": -1, "ai_chat_messages_weekly": -1}');

-- Function to get current week start (Monday) - FIXED
CREATE OR REPLACE FUNCTION get_week_start(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT (input_date - ((EXTRACT(DOW FROM input_date)::INTEGER + 6) % 7) * INTERVAL '1 day')::DATE;
$$;

-- Function to check if user is premium
CREATE OR REPLACE FUNCTION is_user_premium(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_subscriptions 
    WHERE user_subscriptions.user_id = is_user_premium.user_id
      AND plan_type IN ('monthly', 'yearly')
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- Function to get user's current usage for the week
CREATE OR REPLACE FUNCTION get_user_weekly_usage(user_id UUID)
RETURNS TABLE(
  routines_created INTEGER,
  nutrition_photos_used INTEGER,
  ai_chat_messages_used INTEGER,
  week_start_date DATE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(ul.routines_created, 0)::INTEGER,
    COALESCE(ul.nutrition_photos_used, 0)::INTEGER,
    COALESCE(ul.ai_chat_messages_used, 0)::INTEGER,
    get_week_start()
  FROM public.usage_limits ul
  WHERE ul.user_id = get_user_weekly_usage.user_id
    AND ul.week_start_date = get_week_start()
  UNION ALL
  SELECT 0, 0, 0, get_week_start()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.usage_limits ul2
    WHERE ul2.user_id = get_user_weekly_usage.user_id
      AND ul2.week_start_date = get_week_start()
  )
  LIMIT 1;
$$;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage_counter(
  user_id UUID,
  counter_type TEXT,
  increment_by INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_start DATE := get_week_start();
BEGIN
  -- Insert or update usage record
  INSERT INTO public.usage_limits (user_id, week_start_date, routines_created, nutrition_photos_used, ai_chat_messages_used)
  VALUES (
    user_id, 
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
$$;

-- Function to automatically create free subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$;

-- Trigger to create default subscription when user is created
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Function to update subscription status based on expiration
CREATE OR REPLACE FUNCTION update_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();
END;
$$;
