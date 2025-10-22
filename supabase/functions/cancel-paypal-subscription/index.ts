import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancelSubscriptionRequest {
  subscriptionId: string;
  reason?: string;
}

interface PayPalTokenResponse {
  access_token: string;
}

// Obtener token de acceso de PayPal
async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const baseUrl = paypalMode === 'live' 
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal token error:', error);
    throw new Error('Failed to get PayPal access token');
  }

  const data: PayPalTokenResponse = await response.json();
  return data.access_token;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header (automatically included by supabase.functions.invoke)
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', authHeader ? 'Yes' : 'No');

    if (!authHeader) {
      throw new Error('No authorization token provided');
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');

    // Use service role key for all operations (auth validation and DB)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify JWT token using service role
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    console.log('User auth result:', { userId: user?.id, error: userError?.message });

    if (userError || !user) {
      console.error('Authentication failed:', userError);
      throw new Error('Usuario no autenticado');
    }

    const { subscriptionId, reason }: CancelSubscriptionRequest = await req.json();

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    console.log('Cancelling PayPal subscription:', subscriptionId);

    // Obtener token de PayPal
    const accessToken = await getPayPalAccessToken();

    const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
    const baseUrl = paypalMode === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Cancelar suscripción en PayPal
    const cancelResponse = await fetch(
      `${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'User requested cancellation'
        })
      }
    );

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text();
      console.error('PayPal cancellation error:', errorText);
      
      // Si la suscripción ya está cancelada, no es un error crítico
      if (cancelResponse.status === 422) {
        console.log('Subscription already cancelled in PayPal');
      } else {
        throw new Error(`Failed to cancel PayPal subscription: ${errorText}`);
      }
    }

    console.log('PayPal subscription cancelled successfully');

    // Update subscription status in Supabase using admin client
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        auto_renewal: false,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'User requested cancellation',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('paypal_subscription_id', subscriptionId);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      throw updateError;
    }

    console.log('Subscription updated in database');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Suscripción cancelada exitosamente. Tendrás acceso hasta el final del periodo de facturación actual.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in cancel-paypal-subscription:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
