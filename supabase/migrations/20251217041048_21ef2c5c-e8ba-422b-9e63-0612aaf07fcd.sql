-- ==============================================
-- RevenueCat Webhook Integration
-- ==============================================

-- Tabla de auditoría para eventos de RevenueCat (idempotencia y logging)
CREATE TABLE IF NOT EXISTS revenuecat_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  app_user_id TEXT,
  product_id TEXT,
  store TEXT,
  environment TEXT,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_revenuecat_events_user ON revenuecat_webhook_events(app_user_id);
CREATE INDEX idx_revenuecat_events_type ON revenuecat_webhook_events(event_type);
CREATE INDEX idx_revenuecat_events_created ON revenuecat_webhook_events(created_at);

-- RLS deshabilitado para esta tabla (solo acceso desde Edge Functions con service_role)
ALTER TABLE revenuecat_webhook_events ENABLE ROW LEVEL SECURITY;

-- Agregar columna para tracking de RevenueCat en user_subscriptions
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS revenuecat_original_transaction_id TEXT;