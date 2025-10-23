/**
 * Validates PayPal webhook signatures to ensure webhooks are authentic
 * This is CRITICAL for security - prevents fake webhook attacks
 */

interface WebhookValidationParams {
  transmissionId: string | null;
  transmissionTime: string | null;
  certUrl: string | null;
  signature: string | null;
  body: string;
  webhookId: string | undefined;
}

export async function validateWebhookSignature(
  params: WebhookValidationParams
): Promise<boolean> {
  const { transmissionId, transmissionTime, certUrl, signature, body, webhookId } = params;

  // If webhook signature validation is disabled (development only), skip validation
  if (Deno.env.get('PAYPAL_SKIP_WEBHOOK_VALIDATION') === 'true') {
    console.warn('⚠️ WARNING: Webhook signature validation is DISABLED. This should ONLY be used in development!');
    return true;
  }

  // Validate all required headers are present
  if (!transmissionId || !transmissionTime || !certUrl || !signature || !webhookId) {
    console.error('Missing required webhook headers for signature validation');
    return false;
  }

  try {
    // Get PayPal access token
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
    const baseUrl = paypalMode === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const auth = btoa(`${clientId}:${clientSecret}`);
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get PayPal access token for webhook validation');
      return false;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Call PayPal's webhook signature verification endpoint
    const verifyResponse = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: 'SHA256withRSA',
        transmission_sig: signature,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body)
      })
    });

    if (!verifyResponse.ok) {
      console.error('PayPal webhook verification API call failed:', verifyResponse.status);
      return false;
    }

    const verifyData = await verifyResponse.json();
    
    if (verifyData.verification_status === 'SUCCESS') {
      console.log('✅ Webhook signature validated successfully');
      return true;
    } else {
      console.error('❌ Webhook signature validation failed:', verifyData.verification_status);
      return false;
    }

  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}
