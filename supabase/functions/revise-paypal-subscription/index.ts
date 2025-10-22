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

interface ReviseSubscriptionRequest {
  currentSubscriptionId: string;
  newPlanType: 'monthly' | 'yearly';
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { currentSubscriptionId, newPlanType, userId, returnUrl, cancelUrl }: ReviseSubscriptionRequest = await req.json();
    
    if (!currentSubscriptionId || !newPlanType || !userId) {
      throw new Error('Current subscription ID, new plan type, and user ID are required');
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
        'Accept': 'application/json',
      },
      body: 'grant_type=client_credentials'
    });

    if (!paypalTokenResponse.ok) {
      const errorText = await paypalTokenResponse.text();
      console.error('PayPal token error:', errorText);
      throw new Error(`PayPal authentication failed: ${paypalTokenResponse.status}`);
    }

    const tokenData: PayPalTokenResponse = await paypalTokenResponse.json();

    // Get new plan details
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_type', newPlanType)
      .eq('is_active', true)
      .single();

    if (planError || !newPlan) {
      throw new Error('New subscription plan not found');
    }

    // Get current subscription from DB
    const { data: currentSub, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('paypal_subscription_id', currentSubscriptionId)
      .eq('user_id', userId)
      .single();

    if (subError || !currentSub) {
      throw new Error('Current subscription not found');
    }

    // VALIDACIÓN: Bloquear downgrade de yearly a monthly
    if (currentSub.plan_type === 'yearly' && newPlanType === 'monthly') {
      throw new Error('No se puede cambiar de plan Anual a Mensual. Por favor contacta soporte si necesitas asistencia.');
    }

    // Calculate days until current plan expires
    const now = new Date();
    const expiresAt = new Date(currentSub.expires_at);
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Prevent changes in last 24 hours before billing
    if (hoursUntilExpiry < 24) {
      throw new Error('No se puede cambiar el plan en las últimas 24 horas antes del siguiente cobro. Por favor intenta después de tu próxima facturación.');
    }

    // Create new PayPal plan for the revision
    const billingCycles = [{
      frequency: {
        interval_unit: newPlanType === 'monthly' ? 'MONTH' : 'YEAR',
        interval_count: 1
      },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0, // Infinite
      pricing_scheme: {
        fixed_price: {
          value: newPlan.price_usd.toFixed(2),
          currency_code: "USD"
        }
      }
    }];

    const planPayload = {
      product_id: "GATOFIT_PRODUCT",
      name: `GatoFit ${newPlanType === 'monthly' ? 'Mensual' : 'Anual'}`,
      description: `Suscripción ${newPlanType === 'monthly' ? 'mensual' : 'anual'} a GatoFit Premium`,
      status: "ACTIVE",
      billing_cycles: billingCycles,
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      }
    };

    // Create new billing plan
    const planResponse = await fetch('https://api-m.sandbox.paypal.com/v1/billing/plans', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'PayPal-Request-Id': `plan-revise-${userId}-${Date.now()}`
      },
      body: JSON.stringify(planPayload)
    });

    const planData = await planResponse.json();
    
    if (!planResponse.ok) {
      console.error('PayPal plan creation failed:', planData);
      throw new Error(`Failed to create new plan: ${planData.message || 'Unknown error'}`);
    }

    console.log('New plan created:', planData.id);

    // Use PayPal Revise API to change the subscription
    const revisePayload = {
      plan_id: planData.id,
      application_context: {
        brand_name: "GatoFit",
        locale: "es-ES",
        shipping_preference: "NO_SHIPPING",
        user_action: "CONTINUE",
        return_url: returnUrl,
        cancel_url: cancelUrl
      }
    };

    const reviseResponse = await fetch(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${currentSubscriptionId}/revise`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(revisePayload)
      }
    );

    const reviseData = await reviseResponse.json();
    
    if (!reviseResponse.ok) {
      console.error('PayPal revise failed:', reviseData);
      throw new Error(`Failed to revise subscription: ${reviseData.message || 'Unknown error'}`);
    }

    // Find approval URL
    const approvalUrl = reviseData.links?.find((link: any) => link.rel === 'approve')?.href;
    
    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    console.log(`Subscription revision initiated for user ${userId}, changing to ${newPlanType}`);

    return new Response(JSON.stringify({
      success: true,
      approvalUrl: approvalUrl,
      newPlanType: newPlanType,
      effectiveDate: currentSub.expires_at
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in revise-paypal-subscription:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
