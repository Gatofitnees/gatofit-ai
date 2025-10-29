-- Create RPC function for secure discount code validation
CREATE OR REPLACE FUNCTION public.validate_discount_code(
  p_code TEXT,
  p_user_id UUID,
  p_plan_type TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  discount_record RECORD;
  user_usage_count INTEGER;
BEGIN
  -- Find the discount code (case insensitive)
  SELECT * INTO discount_record
  FROM discount_codes
  WHERE LOWER(code) = LOWER(TRIM(p_code))
    AND is_active = true;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'El código ingresado no existe o ha expirado'
    );
  END IF;

  -- Check validity dates
  IF discount_record.valid_from IS NOT NULL AND discount_record.valid_from > now() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Este código aún no está disponible'
    );
  END IF;

  IF discount_record.valid_to IS NOT NULL AND discount_record.valid_to < now() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Este código ya no es válido'
    );
  END IF;

  -- Check max uses
  IF discount_record.max_uses IS NOT NULL AND discount_record.current_uses >= discount_record.max_uses THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Este código ha alcanzado su límite de usos'
    );
  END IF;

  -- Check if user already used this code (for single_use codes)
  IF discount_record.usage_type = 'single_use' THEN
    SELECT COUNT(*) INTO user_usage_count
    FROM user_discount_codes
    WHERE user_id = p_user_id
      AND discount_code_id = discount_record.id;

    IF user_usage_count > 0 THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Ya has usado este código anteriormente'
      );
    END IF;
  END IF;

  -- Check if code applies to selected plan
  IF p_plan_type IS NOT NULL AND discount_record.applicable_plans IS NOT NULL THEN
    IF NOT (
      p_plan_type = ANY(discount_record.applicable_plans) OR
      'both' = ANY(discount_record.applicable_plans)
    ) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Este código no es válido para el plan ' || 
          CASE p_plan_type 
            WHEN 'monthly' THEN 'mensual'
            WHEN 'yearly' THEN 'anual'
            ELSE p_plan_type
          END
      );
    END IF;
  END IF;

  -- All validations passed, return discount info
  RETURN json_build_object(
    'success', true,
    'discount', json_build_object(
      'type', discount_record.discount_type,
      'value', discount_record.discount_value,
      'application_type', discount_record.application_type,
      'paypal_discount_percentage', discount_record.paypal_discount_percentage,
      'paypal_discount_fixed', discount_record.paypal_discount_fixed,
      'applicable_plans', discount_record.applicable_plans
    )
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', 'Error al validar el código'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_discount_code(TEXT, UUID, TEXT) TO authenticated;