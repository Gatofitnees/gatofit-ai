import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Retry payment request from user:', user.id);

    // Get user's subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'payment_failed') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No hay pagos pendientes',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (!subscription.paypal_subscription_id) {
      throw new Error('PayPal subscription ID not found');
    }

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

    // Get subscription details from PayPal
    const subscriptionResponse = await fetch(
      `${paypalBaseUrl}/v1/billing/subscriptions/${subscription.paypal_subscription_id}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!subscriptionResponse.ok) {
      throw new Error('Failed to get PayPal subscription details');
    }

    const paypalSubscription = await subscriptionResponse.json();
    console.log('PayPal subscription status:', paypalSubscription.status);

    // Check if payment has been resolved
    if (paypalSubscription.status === 'ACTIVE') {
      // Payment was resolved! Update DB
      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
      }

      // Mark payment failure as resolved
      await supabaseClient
        .from('subscription_payment_failures')
        .update({
          resolved_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .is('resolved_at', null);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'El pago se ha procesado correctamente',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Update retry count
    await supabaseClient
      .from('subscription_payment_failures')
      .update({
        retry_count: supabaseClient.rpc('increment', { x: 1 }),
        last_retry_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .is('resolved_at', null);

    // Payment still pending
    return new Response(
      JSON.stringify({
        success: false,
        message: 'El pago aún está pendiente. Puedes crear una nueva suscripción desde los planes disponibles.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in retry-paypal-payment:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Error al procesar reintento de pago',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
