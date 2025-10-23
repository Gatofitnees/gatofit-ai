-- Paso 2: Insertar plan de prueba diario para testing de pagos recurrentes
INSERT INTO subscription_plans (
  plan_type, 
  name, 
  price_usd, 
  duration_days, 
  features, 
  is_active
) VALUES (
  'test_daily',
  'Plan de Prueba Diario',
  0.50,
  1,
  '{"routines_limit": -1, "nutrition_photos_weekly": -1, "ai_chat_messages_weekly": -1}'::jsonb,
  true
)
ON CONFLICT (plan_type) DO UPDATE SET
  name = EXCLUDED.name,
  price_usd = EXCLUDED.price_usd,
  duration_days = EXCLUDED.duration_days,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();