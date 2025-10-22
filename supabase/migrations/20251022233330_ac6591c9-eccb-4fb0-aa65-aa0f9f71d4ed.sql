-- Crear tabla para registrar fallos de pago
CREATE TABLE IF NOT EXISTS public.subscription_payment_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  failed_at timestamptz NOT NULL DEFAULT now(),
  failure_reason text,
  retry_count integer DEFAULT 0,
  last_retry_at timestamptz,
  resolved_at timestamptz,
  grace_period_ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_payment_failures_user_id ON public.subscription_payment_failures(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_failures_subscription_id ON public.subscription_payment_failures(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_failures_grace_period ON public.subscription_payment_failures(grace_period_ends_at) WHERE resolved_at IS NULL;

-- RLS policies para subscription_payment_failures
ALTER TABLE public.subscription_payment_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment failures"
  ON public.subscription_payment_failures
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment failures"
  ON public.subscription_payment_failures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.id = auth.uid() 
        AND au.is_active = true
    )
  );