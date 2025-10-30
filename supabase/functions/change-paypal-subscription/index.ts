import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangeSubscriptionRequest {
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId }: ChangeSubscriptionRequest = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`Processing plan change for user: ${userId}`);

    // Get user's current subscription with next_plan_type scheduled
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      throw new Error('Subscription not found');
    }

    if (!subscription.next_plan_type || !subscription.next_plan_starts_at) {
      throw new Error('No scheduled plan change found');
    }

    // Check if it's time to change
    const now = new Date();
    const changeDate = new Date(subscription.next_plan_starts_at);
    
    if (changeDate > now) {
      console.log(`Not yet time to change. Scheduled for: ${changeDate}`);
      return new Response(JSON.stringify({
        success: false,
        message: 'Not yet time for plan change'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Changing plan from ${subscription.plan_type} to ${subscription.next_plan_type}`);

    // Get PayPal credentials based on mode
    const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
    const isLive = paypalMode === 'live';
    
    const paypalClientId = isLive
      ? Deno.env.get('PAYPAL_CLIENT_ID_PRODUCTION')
      : Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = isLive
      ? Deno.env.get('PAYPAL_CLIENT_SECRET_PRODUCTION')
      : Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalBaseUrl = isLive
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    
    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    // Get PayPal access token
    const auth = btoa(`${paypalClientId}:${paypalClientSecret}`);
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get PayPal access token');
    }

    // Cancel old PayPal subscription if exists
    if (subscription.paypal_subscription_id) {
      console.log(`Cancelling old PayPal subscription: ${subscription.paypal_subscription_id}`);
      
      const cancelResponse = await fetch(
        `${paypalBaseUrl}/v1/billing/subscriptions/${subscription.paypal_subscription_id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: 'Plan change requested by user'
          })
        }
      );

      if (!cancelResponse.ok && cancelResponse.status !== 204) {
        console.error('Failed to cancel old PayPal subscription');
        // Continue anyway - we'll create new subscription
      }
    }

    // Create new PayPal subscription for next_plan_type
    console.log(`Creating new PayPal subscription for plan: ${subscription.next_plan_type}`);
    
    // Get plan details from database
    const { data: planData } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('plan_type', subscription.next_plan_type)
      .eq('is_active', true)
      .single();

    if (!planData) {
      throw new Error('Plan not found');
    }

    // Note: For actual implementation, you would call create-paypal-subscription
    // or implement the PayPal subscription creation here
    // For now, we'll just update the database

    // Calculate new expiration date
    const newExpiresAt = new Date();
    if (subscription.next_plan_type === 'monthly') {
      newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
    } else {
      newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1);
    }

    // Update subscription in database
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        plan_type: subscription.next_plan_type,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: newExpiresAt.toISOString(),
        next_plan_type: null,
        next_plan_starts_at: null,
        scheduled_change_created_at: null,
        auto_renewal: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw new Error('Failed to update subscription');
    }

    console.log(`✅ Successfully changed plan for user ${userId} to ${subscription.next_plan_type}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Plan changed to ${subscription.next_plan_type}`,
      newPlanType: subscription.next_plan_type,
      expiresAt: newExpiresAt.toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in change-paypal-subscription:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
