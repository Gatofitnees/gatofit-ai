-- Create discount_codes table
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('months_free', 'percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_to TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on discount_codes
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for discount_codes
CREATE POLICY "Anyone can view active discount codes" 
ON public.discount_codes 
FOR SELECT 
USING (is_active = true AND (valid_to IS NULL OR valid_to > now()));

CREATE POLICY "Admins can manage discount codes" 
ON public.discount_codes 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Create user_discount_codes table
CREATE TABLE public.user_discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT now(),
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  UNIQUE(user_id, discount_code_id)
);

-- Enable RLS on user_discount_codes
ALTER TABLE public.user_discount_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_discount_codes
CREATE POLICY "Users can view their own discount code usage" 
ON public.user_discount_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own discount code usage" 
ON public.user_discount_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all discount code usage" 
ON public.user_discount_codes 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Insert the "ebooksecret" discount code
INSERT INTO public.discount_codes (
  code, 
  discount_type, 
  discount_value, 
  max_uses, 
  is_active
) VALUES (
  'ebooksecret',
  'months_free',
  6,
  NULL, -- unlimited uses
  true
);

-- Add PayPal transaction tracking to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN paypal_subscription_id TEXT,
ADD COLUMN paypal_payer_id TEXT,
ADD COLUMN payment_method TEXT DEFAULT 'stripe';

-- Create function to apply discount code
CREATE OR REPLACE FUNCTION public.apply_discount_code(
  p_user_id UUID,
  p_code TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  discount_record RECORD;
  result JSON;
BEGIN
  -- Check if code exists and is valid
  SELECT * INTO discount_record
  FROM discount_codes
  WHERE code = p_code 
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_to IS NULL OR valid_to > now())
    AND (max_uses IS NULL OR current_uses < max_uses);

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Código inválido o expirado');
  END IF;

  -- Check if user already used this code
  IF EXISTS (
    SELECT 1 FROM user_discount_codes 
    WHERE user_id = p_user_id AND discount_code_id = discount_record.id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Ya has usado este código');
  END IF;

  -- Mark code as used by user
  INSERT INTO user_discount_codes (user_id, discount_code_id)
  VALUES (p_user_id, discount_record.id);

  -- Update usage count if max_uses is not null
  IF discount_record.max_uses IS NOT NULL THEN
    UPDATE discount_codes 
    SET current_uses = current_uses + 1,
        updated_at = now()
    WHERE id = discount_record.id;
  END IF;

  -- Apply discount based on type
  IF discount_record.discount_type = 'months_free' THEN
    -- Update or create subscription with free months
    INSERT INTO user_subscriptions (
      user_id, 
      plan_type, 
      status, 
      expires_at,
      started_at
    )
    VALUES (
      p_user_id,
      'monthly', -- Default to monthly for free months
      'active',
      now() + (discount_record.discount_value || ' months')::interval,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      expires_at = CASE 
        WHEN user_subscriptions.expires_at > now() 
        THEN user_subscriptions.expires_at + (discount_record.discount_value || ' months')::interval
        ELSE now() + (discount_record.discount_value || ' months')::interval
      END,
      plan_type = 'monthly',
      status = 'active',
      updated_at = now();
  END IF;

  RETURN json_build_object(
    'success', true, 
    'discount', json_build_object(
      'type', discount_record.discount_type,
      'value', discount_record.discount_value
    )
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', 'Error al aplicar el código');
END;
$$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_discount_codes
    BEFORE UPDATE ON public.discount_codes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();