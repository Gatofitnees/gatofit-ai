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
  planType: 'monthly' | 'yearly';
  userId: string;
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

    const { planType, userId }: PayPalSubscriptionRequest = await req.json();
    
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
    const paypalTokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData: PayPalTokenResponse = await paypalTokenResponse.json();
    
    if (!tokenData.access_token) {
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

    // Create PayPal plan first, then subscription
    const planPayload = {
      product_id: "GATOFIT_PRODUCT",
      name: `GatoFit ${planType === 'monthly' ? 'Mensual' : 'Anual'}`,
      description: `Suscripción ${planType === 'monthly' ? 'mensual' : 'anual'} a GatoFit Premium`,
      status: "ACTIVE",
      billing_cycles: [{
        frequency: {
          interval_unit: planType === 'monthly' ? 'MONTH' : 'YEAR',
          interval_count: 1
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // 0 means infinite
        pricing_scheme: {
          fixed_price: {
            value: plans.price_usd.toString(),
            currency_code: "USD"
          }
        }
      }],
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
        return_url: `https://628cddac-e2d9-484d-a252-d981a8e3ed9f.sandbox.lovable.dev/subscription?success=true`,
        cancel_url: `https://628cddac-e2d9-484d-a252-d981a8e3ed9f.sandbox.lovable.dev/subscription?cancelled=true`
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

    return new Response(JSON.stringify({
      success: true,
      subscriptionId: subscriptionData.id,
      approvalUrl: approvalUrl
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