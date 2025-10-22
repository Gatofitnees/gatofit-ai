import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivateRequest {
  subscriptionId: string;
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { subscriptionId, reason } = await req.json() as ActivateRequest;

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    console.log('Activating PayPal subscription:', subscriptionId);

    // Get PayPal access token
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalBaseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';

    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const { access_token } = await authResponse.json();

    // Activate the subscription in PayPal
    const activateResponse = await fetch(
      `${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}/activate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          reason: reason || 'User requested reactivation',
        }),
      }
    );

    if (!activateResponse.ok) {
      const errorData = await activateResponse.text();
      console.error('PayPal activate error:', errorData);
      throw new Error(`Failed to activate PayPal subscription: ${errorData}`);
    }

    console.log('PayPal subscription activated successfully');

    // Update subscription status in database
    const { error: updateError } = await supabaseClient
      .from('user_subscriptions')
      .update({
        status: 'active',
        suspended_at: null,
        auto_renewal: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('paypal_subscription_id', subscriptionId);

    if (updateError) {
      console.error('Error updating subscription in DB:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription activated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in activate-paypal-subscription:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
