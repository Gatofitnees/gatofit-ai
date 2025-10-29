import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRecord {
  id: string;
  user_id: string;
  paypal_subscription_id: string | null;
  plan_type: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting expired grace period check...');

    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find all subscriptions with expired grace periods
    const { data: expiredSubscriptions, error: queryError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, user_id, paypal_subscription_id, plan_type')
      .eq('status', 'payment_failed')
      .not('paypal_subscription_id', 'is', null);

    if (queryError) {
      throw new Error(`Query error: ${queryError.message}`);
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('✅ No subscriptions with payment_failed status found');
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No expired grace periods found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${expiredSubscriptions.length} subscriptions with payment_failed status`);

    // Check which ones have actually expired grace periods
    const { data: expiredFailures } = await supabaseAdmin
      .from('subscription_payment_failures')
      .select('user_id, grace_period_ends_at')
      .is('resolved_at', null)
      .lt('grace_period_ends_at', new Date().toISOString());

    if (!expiredFailures || expiredFailures.length === 0) {
      console.log('✅ No expired grace periods found (all still within grace period)');
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No expired grace periods found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const expiredUserIds = new Set(expiredFailures.map(f => f.user_id));
    const subscriptionsToCancel = expiredSubscriptions.filter(
      sub => expiredUserIds.has(sub.user_id)
    );

    console.log(`⚠️ Found ${subscriptionsToCancel.length} subscriptions with truly expired grace periods`);

    // Get PayPal credentials
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalBaseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';

    // Get PayPal access token
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

    let successCount = 0;
    let failureCount = 0;

    // Process each subscription
    for (const subscription of subscriptionsToCancel) {
      try {
        console.log(`🔄 Processing subscription for user ${subscription.user_id}`);

        // Cancel PayPal subscription
        if (subscription.paypal_subscription_id) {
          const cancelResponse = await fetch(
            `${paypalBaseUrl}/v1/billing/subscriptions/${subscription.paypal_subscription_id}/cancel`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                reason: 'Grace period expired after payment failure'
              })
            }
          );

          if (!cancelResponse.ok && cancelResponse.status !== 422) { // 422 means already cancelled
            console.error(`❌ Failed to cancel PayPal subscription ${subscription.paypal_subscription_id}`);
            failureCount++;
            continue;
          }

          console.log(`✅ PayPal subscription ${subscription.paypal_subscription_id} cancelled`);
        }

        // Update subscription in database
        const { error: updateError } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: 'expired',
            auto_renewal: false,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', subscription.user_id);

        if (updateError) {
          console.error(`❌ Error updating subscription for user ${subscription.user_id}:`, updateError);
          failureCount++;
          continue;
        }

        console.log(`✅ Database updated for user ${subscription.user_id}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error processing subscription for user ${subscription.user_id}:`, error);
        failureCount++;
      }
    }

    console.log(`✨ Processing complete: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: successCount,
        failed: failureCount,
        message: `Processed ${successCount} expired grace periods`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Fatal error in check-expired-grace-periods:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Error checking expired grace periods',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
