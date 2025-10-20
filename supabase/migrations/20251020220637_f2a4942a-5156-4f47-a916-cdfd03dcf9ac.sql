-- Actualizar tabla discount_codes para soportar múltiples tipos de descuentos
ALTER TABLE discount_codes 
  ADD COLUMN IF NOT EXISTS applicable_plans TEXT[] DEFAULT ARRAY['monthly', 'yearly'],
  ADD COLUMN IF NOT EXISTS application_type TEXT DEFAULT 'first_billing_only' 
    CHECK (application_type IN ('first_billing_only', 'forever', 'n_months')),
  ADD COLUMN IF NOT EXISTS duration_months INTEGER,
  ADD COLUMN IF NOT EXISTS usage_type TEXT DEFAULT 'single_use'
    CHECK (usage_type IN ('single_use', 'multi_use_limited', 'multi_use_unlimited')),
  ADD COLUMN IF NOT EXISTS paypal_discount_percentage NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS paypal_discount_fixed NUMERIC(10,2);

-- Actualizar tabla user_subscriptions para rastrear descuentos y cancelaciones
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_discount_codes_applicable_plans ON discount_codes USING GIN(applicable_plans);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_discount_code ON user_subscriptions(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_paypal ON user_subscriptions(paypal_subscription_id);