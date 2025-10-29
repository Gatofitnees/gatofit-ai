import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalSubscriptionRequest {
  planType: 'monthly' | 'yearly' | 'test_daily';
  userId: string;
  discountCode?: string;
  returnUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { planType, userId, discountCode, returnUrl }: PayPalSubscriptionRequest = await req.json();
    
    if (!planType || !userId) {
      throw new Error('Plan type and user ID are required');
    }

    // Get PayPal access token
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    const auth = btoa(`${paypalClientId}:${paypalClientSecret}`);
    console.log('PayPal Auth attempt with client ID:', paypalClientId?.substring(0, 10) + '...');
    
    const paypalTokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: 'grant_type=client_credentials'
    });

    console.log('PayPal token response status:', paypalTokenResponse.status);
    
    if (!paypalTokenResponse.ok) {
      const errorText = await paypalTokenResponse.text();
      console.error('PayPal token error response:', errorText);
      throw new Error(`PayPal token request failed: ${paypalTokenResponse.status} - ${errorText}`);
    }

    const tokenData: PayPalTokenResponse = await paypalTokenResponse.json();
    console.log('PayPal token received:', tokenData.access_token ? 'Yes' : 'No');
    
    if (!tokenData.access_token) {
      console.error('PayPal token data:', tokenData);
      throw new Error('Failed to get PayPal access token');
    }

    // Get subscription plan details from Supabase
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_type', planType)
      .eq('is_active', true)
      .single();

    if (plansError || !plans) {
      throw new Error('Subscription plan not found');
    }

    let finalPrice = plans.price_usd;
    let discountCodeId = null;
    let discountInfo = null;

    // Validate and apply discount code if provided
    if (discountCode) {
      console.log('Validating discount code:', discountCode);

      const { data: discount, error: discountError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toLowerCase())
        .eq('is_active', true)
        .single();

      if (discountError || !discount) {
        console.error('Discount code not found or invalid:', discountError);
        throw new Error('Código de descuento inválido');
      }

      // Check if discount applies to the selected plan
      if (discount.applicable_plans && 
          !discount.applicable_plans.includes(planType) && 
          !discount.applicable_plans.includes('both')) {
        throw new Error('Código de descuento no válido para este plan');
      }

      // Check validity dates
      if (discount.valid_from && new Date(discount.valid_from) > new Date()) {
        throw new Error('Código de descuento aún no disponible');
      }

      if (discount.valid_to && new Date(discount.valid_to) < new Date()) {
        throw new Error('Código de descuento expirado');
      }

      // Check usage limit
      if (discount.max_uses && discount.current_uses >= discount.max_uses) {
        throw new Error('Código de descuento agotado');
      }

      // Check if user already used this code
      const { data: userUsage } = await supabase
        .from('user_discount_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('discount_code_id', discount.id)
        .single();

      if (userUsage && discount.usage_type === 'single_use') {
        throw new Error('Ya has usado este código anteriormente');
      }

      // Calculate PayPal price (months_free don't affect PayPal price)
      if (discount.discount_type === 'months_free') {
        // Free months will be applied after payment verification
        finalPrice = plans.price_usd;
        console.log('Free months discount detected - will apply after payment confirmation');
      } else if (discount.paypal_discount_fixed) {
        finalPrice = Math.max(0, finalPrice - discount.paypal_discount_fixed);
      } else if (discount.paypal_discount_percentage) {
        finalPrice = finalPrice * (1 - discount.paypal_discount_percentage / 100);
      }

      discountCodeId = discount.id;
      discountInfo = discount;
      console.log('Discount validated:', {
        type: discount.discount_type,
        originalPrice: plans.price_usd,
        paypalPrice: finalPrice,
        willApplyMonthsFree: discount.discount_type === 'months_free'
      });
    }

    // Create PayPal plan first, then subscription
    const billingCycles = [];

    // Determine interval_unit based on planType
    let intervalUnit: 'DAY' | 'MONTH' | 'YEAR';
    let planDisplayName: string;
    
    if (planType === 'test_daily') {
      intervalUnit = 'DAY';
      planDisplayName = 'Prueba Diaria (Test)';
    } else if (planType === 'monthly') {
      intervalUnit = 'MONTH';
      planDisplayName = 'Mensual';
    } else {
      intervalUnit = 'YEAR';
      planDisplayName = 'Anual';
    }

    // Configure billing cycles based on discount type
    if (discountInfo && discountInfo.application_type === 'first_billing_only' && discountInfo.discount_type !== 'months_free') {
      // First cycle with discount
      billingCycles.push({
        frequency: {
          interval_unit: intervalUnit,
          interval_count: 1
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 1,
        pricing_scheme: {
          fixed_price: {
            value: finalPrice.toFixed(2),
            currency_code: "USD"
          }
        }
      });

      // Subsequent cycles at normal price
      billingCycles.push({
        frequency: {
          interval_unit: intervalUnit,
          interval_count: 1
        },
        tenure_type: "REGULAR",
        sequence: 2,
        total_cycles: 0, // Infinite
        pricing_scheme: {
          fixed_price: {
            value: plans.price_usd.toFixed(2),
            currency_code: "USD"
          }
        }
      });
    } else {
      // Single cycle (no discount, forever discount, or months_free)
      billingCycles.push({
        frequency: {
          interval_unit: intervalUnit,
          interval_count: 1
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // Infinite
        pricing_scheme: {
          fixed_price: {
            value: finalPrice.toFixed(2),
            currency_code: "USD"
          }
        }
      });
    }

    const planPayload = {
      product_id: "GATOFIT_PRODUCT",
      name: `GatoFit ${planDisplayName}${discountInfo ? ' (Con descuento)' : ''}`,
      description: `Suscripción ${planDisplayName.toLowerCase()} a GatoFit Premium`,
      status: "ACTIVE",
      billing_cycles: billingCycles,
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      },
      taxes: {
        percentage: "0",
        inclusive: false
      }
    };

    // First, create or get the product
    const productPayload = {
      id: "GATOFIT_PRODUCT",
      name: "GatoFit Premium",
      description: "Acceso premium a todas las funcionalidades de GatoFit",
      type: "SERVICE",
      category: "SOFTWARE"
    };

    // Try to create product (it might already exist)
    const productResponse = await fetch('https://api-m.sandbox.paypal.com/v1/catalogs/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'PayPal-Request-Id': `product-${Date.now()}`
      },
      body: JSON.stringify(productPayload)
    });

    // Create the billing plan
    const planResponse = await fetch('https://api-m.sandbox.paypal.com/v1/billing/plans', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'PayPal-Request-Id': `plan-${userId}-${Date.now()}`
      },
      body: JSON.stringify(planPayload)
    });

    const planData = await planResponse.json();
    
    if (!planResponse.ok) {
      console.error('PayPal plan creation failed:', planData);
      throw new Error(`PayPal plan creation failed: ${planData.message || 'Unknown error'}`);
    }

    // Now create the subscription using the plan ID
    const subscriptionPayload = {
      plan_id: planData.id,
      quantity: "1",
      application_context: {
        brand_name: "GatoFit",
        locale: "es-ES",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        },
        return_url: `${returnUrl || 'https://628cddac-e2d9-484d-a252-d981a8e3ed9f.sandbox.lovable.dev'}/subscription?success=true`,
        cancel_url: `${returnUrl || 'https://628cddac-e2d9-484d-a252-d981a8e3ed9f.sandbox.lovable.dev'}/subscription?cancelled=true`
      }
    };

    const subscriptionResponse = await fetch('https://api-m.sandbox.paypal.com/v1/billing/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'PayPal-Request-Id': `${userId}-${Date.now()}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscriptionPayload)
    });

    const subscriptionData = await subscriptionResponse.json();
    
    if (!subscriptionResponse.ok) {
      console.error('PayPal subscription creation failed:', subscriptionData);
      throw new Error(`PayPal subscription creation failed: ${subscriptionData.message || 'Unknown error'}`);
    }

    // Find approval URL
    const approvalUrl = subscriptionData.links?.find((link: any) => link.rel === 'approve')?.href;
    
    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    // Log subscription creation attempt
    console.log(`PayPal subscription created for user ${userId}, plan: ${planType}, subscription ID: ${subscriptionData.id}`);

    // Return discount code info for verification (usage will be recorded after payment confirmation)
    return new Response(JSON.stringify({
      success: true,
      subscriptionId: subscriptionData.id,
      approvalUrl: approvalUrl,
      discountCode: discountCode || null,
      discountType: discountInfo?.discount_type || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-paypal-subscription:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});