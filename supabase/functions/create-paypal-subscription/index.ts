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

    // Create PayPal subscription
    const subscriptionPayload = {
      plan_id: planType === 'monthly' ? 'P-MONTHLY-PLAN-ID' : 'P-YEARLY-PLAN-ID', // These should be real PayPal plan IDs
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
        return_url: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/subscription?success=true`,
        cancel_url: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/subscription?cancelled=true`
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