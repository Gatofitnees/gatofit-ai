import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { subscriptionId, reason } = await req.json();
    console.log('Cancel request:', { subscriptionId, userId: user.id, reason });

    if (!subscriptionId) {
      throw new Error('Missing subscriptionId');
    }

    // 1. Check current subscription status in DB
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('paypal_subscription_id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      console.error('Subscription not found:', subError);
      throw new Error('Subscription not found');
    }

    // 2. If already cancelled (auto_renewal = false), return success
    if (subscription.auto_renewal === false) {
      console.log('Subscription already cancelled locally');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'La suscripción ya fue cancelada anteriormente',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // 3. Try to cancel in PayPal
    const PAYPAL_API = Deno.env.get('PAYPAL_MODE') === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

    // Get PayPal access token
    const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      console.error('PayPal auth failed:', await authResponse.text());
      throw new Error('Failed to authenticate with PayPal');
    }

    const { access_token } = await authResponse.json();

    // Cancel subscription in PayPal
    const cancelResponse = await fetch(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          reason: reason || 'User requested cancellation',
        }),
      }
    );

    // 4. Handle PayPal response
    if (cancelResponse.ok || cancelResponse.status === 204) {
      // Success - update DB
      console.log('PayPal cancellation successful');
      
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          auto_renewal: false,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('paypal_subscription_id', subscriptionId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update DB:', updateError);
        throw new Error('Failed to update subscription status');
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Suscripción cancelada exitosamente',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // 5. Handle PayPal error - check if already cancelled (422)
    const errorData = await cancelResponse.json();
    console.error('PayPal error:', errorData);

    if (cancelResponse.status === 422 && 
        errorData.name === 'SUBSCRIPTION_STATUS_INVALID') {
      // Subscription already cancelled in PayPal, sync DB
      console.log('Subscription already cancelled in PayPal, syncing DB');
      
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          auto_renewal: false,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('paypal_subscription_id', subscriptionId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to sync DB:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'La suscripción ya fue cancelada anteriormente',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Other PayPal error
    throw new Error(`PayPal error: ${errorData.message || 'Unknown error'}`);

  } catch (error) {
    console.error('Error in cancel-paypal-subscription:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
