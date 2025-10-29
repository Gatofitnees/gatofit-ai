import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { validateWebhookSignature } from './webhook-validator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    billing_agreement_id?: string;
    amount?: {
      total: string;
      currency: string;
    };
    state?: string;
  };
  create_time: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature validation
    const rawBody = await req.text();
    const event: PayPalWebhookEvent = JSON.parse(rawBody);
    
    // Validate webhook signature (CRITICAL SECURITY)
    const isValidSignature = await validateWebhookSignature({
      transmissionId: req.headers.get('paypal-transmission-id'),
      transmissionTime: req.headers.get('paypal-transmission-time'),
      certUrl: req.headers.get('paypal-cert-url'),
      signature: req.headers.get('paypal-transmission-sig'),
      body: rawBody,
      webhookId: Deno.env.get('PAYPAL_WEBHOOK_ID')
    });

    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature - potential security threat!');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid webhook signature' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    console.log('PayPal webhook received:', event.event_type, 'Event ID:', event.id);

    // Check if we already processed this event (idempotency)
    const { data: existingEvent } = await supabase
      .from('paypal_webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log('Event already processed:', event.id);
      return new Response(
        JSON.stringify({ success: true, message: 'Event already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the event in database for auditing
    await supabase.from('paypal_webhook_events').insert({
      event_id: event.id,
      event_type: event.event_type,
      resource_id: event.resource.id,
      payload: event,
      processed_at: new Date().toISOString()
    });

    // Handle different event types
    switch (event.event_type) {
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(supabase, event);
        break;
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(supabase, event);
        break;
      
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(supabase, event);
        break;
      
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.RENEWED':
        await handleSubscriptionActivated(supabase, event);
        break;
      
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePaymentFailed(supabase, event);
        break;
      
      default:
        console.log('Unhandled event type:', event.event_type);
    }

    return new Response(
      JSON.stringify({ success: true, event_type: event.event_type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handlePaymentCompleted(supabase: any, event: PayPalWebhookEvent) {
  // Try multiple sources for subscription ID
  let subscriptionId = event.resource.billing_agreement_id || 
                       event.resource.id;
  
  // Check supplementary data for related IDs
  if (!subscriptionId && event.resource.supplementary_data?.related_ids) {
    subscriptionId = event.resource.supplementary_data.related_ids.order_id;
  }
  
  // Check links array for subscription reference
  if (!subscriptionId && event.resource.links) {
    const subLink = event.resource.links.find((link: any) => 
      link.rel === 'billing_agreement' || link.rel === 'subscription'
    );
    if (subLink?.href) {
      subscriptionId = subLink.href.split('/').pop();
    }
  }

  console.log('Processing payment for subscription:', subscriptionId);

  // Find user subscription by PayPal subscription ID
  const { data: subscription, error: fetchError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('paypal_subscription_id', subscriptionId)
    .maybeSingle();

  if (fetchError || !subscription) {
    console.error('Subscription not found for PayPal ID:', subscriptionId);
    return;
  }

  console.log('Found subscription for user:', subscription.user_id, 'Plan:', subscription.plan_type);

  // Check if this payment resolves a payment failure
  const { data: failureRecords } = await supabase
    .from('subscription_payment_failures')
    .select('*')
    .eq('subscription_id', subscription.id)
    .is('resolved_at', null);

  if (failureRecords && failureRecords.length > 0) {
    console.log('Resolving payment failure for subscription:', subscriptionId);
    
    // Mark payment failure as resolved
    await supabase
      .from('subscription_payment_failures')
      .update({ resolved_at: new Date().toISOString() })
      .eq('subscription_id', subscription.id)
      .is('resolved_at', null);

    // Update subscription status back to active
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        payment_failed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    console.log('Payment failure resolved successfully');
  }

  // Scheduled changes are no longer used - changes are applied immediately
  // This section has been removed as part of the immediate plan change implementation

  // Normal renewal - extend current plan
  // Calculate new expiration date based on plan type
  const currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : new Date();
  const now = new Date();
  
  // If current expiry is in the past, start from now
  const baseDate = currentExpiry > now ? currentExpiry : now;
  
  let newExpiryDate: Date;
  if (subscription.plan_type === 'test_daily') {
    newExpiryDate = new Date(baseDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + 1);
  } else if (subscription.plan_type === 'monthly') {
    newExpiryDate = new Date(baseDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + 30);
  } else if (subscription.plan_type === 'yearly') {
    newExpiryDate = new Date(baseDate);
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
  } else {
    console.error('Unknown plan type:', subscription.plan_type);
    return;
  }

  console.log('Extending subscription from', baseDate.toISOString(), 'to', newExpiryDate.toISOString());

  // Update subscription with new expiry date
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      expires_at: newExpiryDate.toISOString(),
      status: 'active',
      auto_renewal: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    throw updateError;
  }

  console.log('Successfully renewed subscription for user:', subscription.user_id);
}

async function handleSubscriptionCancelled(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.id;
  console.log('Processing cancellation for subscription:', subscriptionId);

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      auto_renewal: false,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription cancellation:', error);
    throw error;
  }

  console.log('Subscription cancelled:', subscriptionId);
}

async function handleSubscriptionSuspended(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.id;
  console.log('Processing suspension for subscription:', subscriptionId);

  // Check if this suspension is due to payment failure
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*, payment_failed_at')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  if (subscription && subscription.payment_failed_at) {
    const paymentFailedDate = new Date(subscription.payment_failed_at);
    const now = new Date();
    const daysSinceFailure = (now.getTime() - paymentFailedDate.getTime()) / (1000 * 60 * 60 * 24);

    // If 4+ days have passed since payment failure, expire the subscription
    if (daysSinceFailure >= 4) {
      console.log('Grace period expired, marking subscription as expired');
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'expired',
          suspended_at: new Date().toISOString(),
          auto_renewal: false,
          updated_at: new Date().toISOString()
        })
        .eq('paypal_subscription_id', subscriptionId);

      if (error) {
        console.error('Error expiring subscription:', error);
        throw error;
      }

      console.log('Subscription expired after grace period:', subscriptionId);
      return;
    }
  }

  // Normal suspension (not due to payment failure expiration)
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      auto_renewal: false,
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription suspension:', error);
    throw error;
  }

  console.log('Subscription suspended:', subscriptionId);
}

async function handlePaymentFailed(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.billing_agreement_id || event.resource.id;
  console.log('Processing payment failure for subscription:', subscriptionId);

  // Find subscription
  const { data: subscription, error: fetchError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  if (fetchError || !subscription) {
    console.error('Subscription not found for payment failure:', subscriptionId);
    return;
  }

  const now = new Date();
  const gracePeriodEnds = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days from now

  // Update subscription to payment_failed status
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'payment_failed',
      payment_failed_at: now.toISOString(),
      auto_renewal: true, // Keep true so PayPal can retry
      updated_at: now.toISOString()
    })
    .eq('id', subscription.id);

  if (updateError) {
    console.error('Error updating subscription for payment failure:', updateError);
    throw updateError;
  }

  // Record payment failure
  const { error: failureError } = await supabase
    .from('subscription_payment_failures')
    .insert({
      subscription_id: subscription.id,
      user_id: subscription.user_id,
      failed_at: now.toISOString(),
      failure_reason: event.resource.state || 'Payment processing failed',
      grace_period_ends_at: gracePeriodEnds.toISOString(),
      retry_count: 0
    });

  if (failureError) {
    console.error('Error recording payment failure:', failureError);
  }

  console.log('Payment failure recorded for subscription:', subscriptionId);
  console.log('Grace period ends at:', gracePeriodEnds.toISOString());
}

async function handleSubscriptionActivated(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.id;
  console.log('Processing activation for subscription:', subscriptionId);

  // Get current subscription data
  const { data: subscription, error: fetchError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('paypal_subscription_id', subscriptionId)
    .maybeSingle();

  if (fetchError || !subscription) {
    console.error('Subscription not found for activation:', subscriptionId);
    return;
  }

  // Scheduled changes are no longer used - changes are applied immediately
  // Normal activation
    // Normal activation (no scheduled change)
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        suspended_at: null,
        auto_renewal: true,
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating subscription activation:', error);
      throw error;
    }

    console.log('Subscription activated:', subscriptionId);
  }
}
