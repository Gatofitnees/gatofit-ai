-- Fix ebooksecret discount code: set duration_months for months_free type
-- This allows the verify-paypal-payment edge function to correctly apply 6 free months

UPDATE discount_codes 
SET duration_months = 6,
    updated_at = now()
WHERE code = 'ebooksecret';

-- Verify the fix
DO $$
DECLARE
  v_duration_months INT;
BEGIN
  SELECT duration_months INTO v_duration_months
  FROM discount_codes
  WHERE code = 'ebooksecret';
  
  IF v_duration_months = 6 THEN
    RAISE NOTICE '✅ ebooksecret correctly updated: duration_months = 6';
  ELSE
    RAISE EXCEPTION '❌ Failed to update ebooksecret';
  END IF;
END $$;