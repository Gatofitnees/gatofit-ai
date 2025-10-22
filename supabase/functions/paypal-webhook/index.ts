import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    // Parse webhook event
    const event: PayPalWebhookEvent = await req.json();
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
  const subscriptionId = event.resource.billing_agreement_id || event.resource.id;
  console.log('Processing payment for subscription:', subscriptionId);

  // Find user subscription by PayPal subscription ID
  const { data: subscription, error: fetchError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  if (fetchError || !subscription) {
    console.error('Subscription not found for PayPal ID:', subscriptionId);
    return;
  }

  console.log('Found subscription for user:', subscription.user_id, 'Plan:', subscription.plan_type);

  // Calculate new expiration date based on plan type
  const currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : new Date();
  const now = new Date();
  
  // If current expiry is in the past, start from now
  const baseDate = currentExpiry > now ? currentExpiry : now;
  
  let newExpiryDate: Date;
  if (subscription.plan_type === 'monthly') {
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

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
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

async function handleSubscriptionActivated(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.id;
  console.log('Processing activation for subscription:', subscriptionId);

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
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
