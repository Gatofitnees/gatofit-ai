import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  token_type: string;
  expires_in: number;
}

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  if (!paypalClientId || !paypalClientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = btoa(`${paypalClientId}:${paypalClientSecret}`);
  
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal token error:', errorText);
    throw new Error(`Failed to get PayPal access token: ${response.status}`);
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
    const { subscriptionId, reason }: CancelSubscriptionRequest = await req.json();
    
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    console.log('Cancelling PayPal subscription:', subscriptionId);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Cancel subscription in PayPal
    const cancelResponse = await fetch(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Customer requested cancellation'
        })
      }
    );

    if (!cancelResponse.ok && cancelResponse.status !== 204) {
      const errorText = await cancelResponse.text();
      console.error('PayPal cancellation error:', errorText);
      throw new Error(`Failed to cancel PayPal subscription: ${cancelResponse.status}`);
    }

    console.log('PayPal subscription cancelled successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription cancelled successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cancel-paypal-subscription:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
