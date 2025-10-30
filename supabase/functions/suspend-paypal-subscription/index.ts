import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuspendRequest {
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

    const { subscriptionId, reason } = await req.json() as SuspendRequest;

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    console.log('Suspending PayPal subscription:', subscriptionId);

    // Get PayPal credentials based on mode
    const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
    const isLive = paypalMode === 'live';
    
    const clientId = isLive
      ? Deno.env.get('PAYPAL_CLIENT_ID_PRODUCTION')
      : Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = isLive
      ? Deno.env.get('PAYPAL_CLIENT_SECRET_PRODUCTION')
      : Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalBaseUrl = isLive
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

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

    // Suspend the subscription in PayPal
    const suspendResponse = await fetch(
      `${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}/suspend`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          reason: reason || 'User requested temporary suspension',
        }),
      }
    );

    if (!suspendResponse.ok) {
      const errorData = await suspendResponse.text();
      console.error('PayPal suspend error:', errorData);
      throw new Error(`Failed to suspend PayPal subscription: ${errorData}`);
    }

    console.log('PayPal subscription suspended successfully');

    // Update subscription status in database
    const { error: updateError } = await supabaseClient
      .from('user_subscriptions')
      .update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        auto_renewal: false,
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
        message: 'Subscription suspended successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in suspend-paypal-subscription:', error);
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
