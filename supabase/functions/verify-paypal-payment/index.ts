import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  subscriptionId: string;
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

    const { subscriptionId, userId }: VerifyPaymentRequest = await req.json();
    
    if (!subscriptionId || !userId) {
      throw new Error('Subscription ID and user ID are required');
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

    const tokenData = await paypalTokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get PayPal access token');
    }

    // Verify subscription status with PayPal
    const subscriptionResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const subscriptionData = await subscriptionResponse.json();
    
    if (!subscriptionResponse.ok) {
      console.error('PayPal subscription verification failed:', subscriptionData);
      throw new Error('PayPal subscription verification failed');
    }

    console.log('PayPal subscription data:', subscriptionData);

    // Check if subscription is active
    if (subscriptionData.status !== 'ACTIVE') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Subscription is not active',
        status: subscriptionData.status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get PayPal plan details to determine the correct plan type
    const planId = subscriptionData.plan_id;
    console.log(`Fetching PayPal plan details for: ${planId}`);
    
    const planResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/plans/${planId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!planResponse.ok) {
      const planError = await planResponse.text();
      console.error('Failed to fetch PayPal plan details:', planError);
      throw new Error('Failed to fetch PayPal plan details');
    }

    const planDetails = await planResponse.json();
    console.log('PayPal plan details:', planDetails);

    // Determine plan type from the billing cycle frequency
    const billingCycle = planDetails.billing_cycles?.find((cycle: any) => cycle.tenure_type === 'REGULAR');
    const intervalUnit = billingCycle?.frequency?.interval_unit;
    const planType = intervalUnit === 'MONTH' ? 'monthly' : 'yearly';

    console.log(`Detected plan type: ${planType} from interval unit: ${intervalUnit}`);

    // Get expected price from database for validation
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('price_usd')
      .eq('plan_type', planType)
      .eq('is_active', true)
      .single();

    const paidAmount = parseFloat(subscriptionData.billing_info?.last_payment?.amount?.value || '0');
    console.log(`Expected price: $${planData?.price_usd}, Paid amount: $${paidAmount}`);

    // Validate price (with tolerance for discounts)
    if (planData && Math.abs(paidAmount - planData.price_usd) > 0.01) {
      console.warn(`Price mismatch - Expected: $${planData.price_usd}, Paid: $${paidAmount} (might be a discount)`);
    }
    
    // Check for existing subscription
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log(`Existing subscription:`, existingSub);

    // Calculate expiration date
    const now = new Date();
    let expiresAt: Date;
    let startedAt: string;

    if (existingSub && existingSub.expires_at) {
      const existingExpiry = new Date(existingSub.expires_at);
      
      // Si aún tiene tiempo restante (no ha expirado)
      if (existingExpiry > now) {
        // Solo permite renovar/extender el MISMO plan
        if (existingSub.plan_type === planType) {
          // EXTENDER tiempo - sumar duración al expires_at existente
          const daysToAdd = planType === 'monthly' ? 30 : 365;
          expiresAt = new Date(existingExpiry);
          expiresAt.setDate(expiresAt.getDate() + daysToAdd);
          startedAt = existingSub.started_at; // Mantener fecha de inicio original
          console.log(`✅ Extending ${planType} plan from ${existingExpiry} to ${expiresAt}`);
        } else {
          // Intentando cambiar de plan mientras hay tiempo activo - no permitir
          console.warn(`❌ Cannot change plan type while subscription is active`);
          throw new Error('No puedes cambiar de plan mientras tienes uno activo. Por favor, programa el cambio para cuando expire tu plan actual.');
        }
      } else {
        // Plan expirado - crear nueva suscripción
        expiresAt = planType === 'monthly' 
          ? new Date(now.setMonth(now.getMonth() + 1))
          : new Date(now.setFullYear(now.getFullYear() + 1));
        startedAt = new Date().toISOString();
        console.log(`📅 Creating new subscription (expired plan)`);
      }
    } else {
      // No hay suscripción previa - crear nueva
      expiresAt = planType === 'monthly' 
        ? new Date(now.setMonth(now.getMonth() + 1))
        : new Date(now.setFullYear(now.getFullYear() + 1));
      startedAt = new Date().toISOString();
      console.log(`🆕 Creating first subscription for user`);
    }

    console.log(`Attempting to update subscription for user ${userId}, plan: ${planType}`);
    console.log(`Started: ${startedAt}, Expires: ${expiresAt.toISOString()}`);

    // Update user subscription in Supabase
    const { data: upsertData, error: updateError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        started_at: startedAt,
        expires_at: expiresAt.toISOString(),
        paypal_subscription_id: subscriptionId,
        paypal_payer_id: subscriptionData.subscriber?.payer_id,
        payment_method: 'paypal',
        auto_renewal: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw new Error('Failed to update subscription in database');
    }

    console.log(`Successfully updated subscription:`, upsertData);

    console.log(`Successfully verified and updated PayPal subscription for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      subscription: {
        id: subscriptionId,
        status: subscriptionData.status,
        planType: planType,
        expiresAt: expiresAt.toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-paypal-payment:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});