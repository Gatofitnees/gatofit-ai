-- Paso 1: Agregar 'test_daily' al enum subscription_plan_type
ALTER TYPE subscription_plan_type ADD VALUE IF NOT EXISTS 'test_daily';