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

    // Determine plan type from PayPal plan ID or billing info
    const billingInfo = subscriptionData.billing_info;
    const planType = billingInfo?.cycle_executions?.[0]?.frequency?.interval_unit === 'MONTH' ? 'monthly' : 'yearly';
    
    // Calculate expiration date
    const now = new Date();
    const expiresAt = planType === 'monthly' 
      ? new Date(now.setMonth(now.getMonth() + 1))
      : new Date(now.setFullYear(now.getFullYear() + 1));

    // Update user subscription in Supabase
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        paypal_subscription_id: subscriptionId,
        paypal_payer_id: subscriptionData.subscriber?.payer_id,
        payment_method: 'paypal',
        auto_renewal: true,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw new Error('Failed to update subscription in database');
    }

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