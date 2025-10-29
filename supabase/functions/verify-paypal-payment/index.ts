import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  subscriptionId: string;
  userId: string;
  discountCode?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subscriptionId, userId, discountCode }: VerifyPaymentRequest = await req.json();
    
    if (!subscriptionId || !userId) {
      throw new Error('Subscription ID and user ID are required');
    }

    // Get PayPal access token
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    const auth = btoa(`${paypalClientId}:${paypalClientSecret}`);
    const paypalTokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await paypalTokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get PayPal access token');
    }

    // Verify subscription status with PayPal
    const subscriptionResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const subscriptionData = await subscriptionResponse.json();
    
    if (!subscriptionResponse.ok) {
      console.error('PayPal subscription verification failed:', subscriptionData);
      throw new Error('PayPal subscription verification failed');
    }

    console.log('PayPal subscription data:', subscriptionData);

    // Get discount code info if provided
    let discountInfo: any = null;
    let discountCodeId: string | null = null;

    if (discountCode) {
      const { data: discount, error: discountError } = await supabase
        .from('discount_codes')
        .select('*')
        .ilike('code', discountCode)
        .eq('is_active', true)
        .single();

      if (!discountError && discount) {
        discountInfo = discount;
        discountCodeId = discount.id;
        console.log('Discount code info retrieved:', {
          code: discountCode,
          type: discount.discount_type,
          value: discount.discount_value,
          durationMonths: discount.duration_months
        });
      }
    }

    // Check if subscription is active
    if (subscriptionData.status !== 'ACTIVE') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Subscription is not active',
        status: subscriptionData.status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get PayPal plan details to determine the correct plan type
    const planId = subscriptionData.plan_id;
    console.log(`Fetching PayPal plan details for: ${planId}`);
    
    const planResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/plans/${planId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!planResponse.ok) {
      const planError = await planResponse.text();
      console.error('Failed to fetch PayPal plan details:', planError);
      throw new Error('Failed to fetch PayPal plan details');
    }

    const planDetails = await planResponse.json();
    console.log('PayPal plan details:', planDetails);

    // Determine plan type from the billing cycle frequency
    const billingCycle = planDetails.billing_cycles?.find((cycle: any) => cycle.tenure_type === 'REGULAR');
    const intervalUnit = billingCycle?.frequency?.interval_unit;
    
    let planType: 'monthly' | 'yearly' | 'test_daily';
    if (intervalUnit === 'DAY') {
      planType = 'test_daily';
    } else if (intervalUnit === 'MONTH') {
      planType = 'monthly';
    } else {
      planType = 'yearly';
    }

    console.log(`Detected plan type: ${planType} from interval unit: ${intervalUnit}`);

    // Get expected price from database for validation
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('price_usd')
      .eq('plan_type', planType)
      .eq('is_active', true)
      .single();

    const paidAmount = parseFloat(subscriptionData.billing_info?.last_payment?.amount?.value || '0');
    console.log(`Expected price: $${planData?.price_usd}, Paid amount: $${paidAmount}`);

    // Validate price (with tolerance for discounts)
    if (planData && Math.abs(paidAmount - planData.price_usd) > 0.01) {
      console.warn(`Price mismatch - Expected: $${planData.price_usd}, Paid: $${paidAmount} (might be a discount)`);
    }
    
    // Check for existing subscription
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log(`Existing subscription:`, existingSub);

    // Calculate expiration date and apply free months
    const now = new Date();
    let expiresAt: Date;
    let startedAt: string;
    let bonusMonthsApplied = 0;

    if (existingSub && existingSub.status === 'active' && existingSub.expires_at) {
      const existingExpiry = new Date(existingSub.expires_at);
      
      // Check if it's active and not expired
      if (existingExpiry > now) {
        // Detect if it's upgrade, downgrade, or same plan
        const isUpgrade = (existingSub.plan_type === 'monthly' && planType === 'yearly');
        const isDowngrade = (existingSub.plan_type === 'yearly' && planType === 'monthly');
        const isSamePlan = (existingSub.plan_type === planType);

        // BLOCK DOWNGRADE
        if (isDowngrade) {
          console.error(`❌ Downgrade not allowed: ${existingSub.plan_type} → ${planType}`);
          return new Response(JSON.stringify({
            success: false,
            error: 'No puedes cambiar de plan Anual a Mensual. Tu plan actual continuará hasta su fecha de expiración.'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // UPGRADE or SAME PLAN - Apply immediately
        console.log(`🔄 Plan change detected: ${existingSub.plan_type} → ${planType} (${isUpgrade ? 'UPGRADE' : 'SAME PLAN'})`);
        
        // Cancel old PayPal subscription
        if (existingSub.paypal_subscription_id && existingSub.paypal_subscription_id !== subscriptionId) {
          console.log(`Cancelling old PayPal subscription: ${existingSub.paypal_subscription_id}`);
          
          try {
            const cancelResponse = await fetch(
              `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${existingSub.paypal_subscription_id}/cancel`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${tokenData.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  reason: 'User changed subscription plan'
                })
              }
            );
            
            if (cancelResponse.ok || cancelResponse.status === 204) {
              console.log('✅ Old PayPal subscription cancelled successfully');
            } else {
              console.warn('⚠️ Could not cancel old PayPal subscription, continuing anyway');
            }
          } catch (cancelError) {
            console.error('Error cancelling old subscription:', cancelError);
            // Continue anyway
          }
        }
        
        // Calculate new expiry from TODAY (not from old expiry)
        if (planType === 'test_daily') {
          expiresAt = new Date(now);
          expiresAt.setDate(expiresAt.getDate() + 1);
        } else if (planType === 'monthly') {
          expiresAt = new Date(now);
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
          expiresAt = new Date(now);
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }
        
        // Apply free months
        if (discountInfo?.discount_type === 'months_free' && discountInfo.duration_months) {
          expiresAt.setMonth(expiresAt.getMonth() + discountInfo.duration_months);
          bonusMonthsApplied = discountInfo.duration_months;
          console.log(`✨ Applied ${bonusMonthsApplied} free months`);
        }
        
        startedAt = new Date().toISOString();
        console.log(`✅ Plan change applied immediately. New expiry: ${expiresAt.toISOString()}`);
      } else {
        // Plan expired - create new subscription
        if (planType === 'test_daily') {
          expiresAt = new Date(now);
          expiresAt.setDate(expiresAt.getDate() + 1);
        } else if (planType === 'monthly') {
          expiresAt = new Date(now);
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
          expiresAt = new Date(now);
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }
        
        // Apply free months
        if (discountInfo?.discount_type === 'months_free' && discountInfo.duration_months) {
          expiresAt.setMonth(expiresAt.getMonth() + discountInfo.duration_months);
          bonusMonthsApplied = discountInfo.duration_months;
          console.log(`✨ Applied ${bonusMonthsApplied} free months to new subscription`);
        }
        
        startedAt = new Date().toISOString();
        console.log(`📅 Creating new subscription (expired plan)`);
      }
    } else {
      // No hay suscripción previa - crear nueva
      if (planType === 'test_daily') {
        expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + 1);
      } else if (planType === 'monthly') {
        expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt = new Date(now);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
      
      // Apply free months
      if (discountInfo?.discount_type === 'months_free' && discountInfo.duration_months) {
        expiresAt.setMonth(expiresAt.getMonth() + discountInfo.duration_months);
        bonusMonthsApplied = discountInfo.duration_months;
        console.log(`✨ Applied ${bonusMonthsApplied} free months to first subscription`);
      }
      
      startedAt = new Date().toISOString();
      console.log(`🆕 Creating first subscription for user`);
    }

    console.log(`Attempting to update subscription for user ${userId}, plan: ${planType}`);
    console.log(`Started: ${startedAt}, Expires: ${expiresAt.toISOString()}`);

    // Update user subscription in Supabase
    const { data: upsertData, error: updateError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        started_at: startedAt,
        expires_at: expiresAt.toISOString(),
        paypal_subscription_id: subscriptionId,
        paypal_payer_id: subscriptionData.subscriber?.payer_id,
        payment_method: 'paypal',
        auto_renewal: true,
        discount_code_id: discountCodeId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw new Error('Failed to update subscription in database');
    }

    console.log(`Successfully updated subscription:`, upsertData);

    // Register discount code usage AFTER successful subscription creation
    if (discountCodeId && discountInfo) {
      console.log('Registering discount code usage...');
      
      // Check if usage already exists
      const { data: existingUsage } = await supabase
        .from('user_discount_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('discount_code_id', discountCodeId)
        .single();
      
      if (!existingUsage) {
        // Insert usage record
        const { error: usageError } = await supabase
          .from('user_discount_codes')
          .insert({
            user_id: userId,
            discount_code_id: discountCodeId,
            used_at: new Date().toISOString()
          });
        
        if (usageError) {
          console.error('Error recording discount usage:', usageError);
        } else {
          console.log('✅ Discount code usage recorded');
        }
        
        // Increment counter if max_uses exists
        if (discountInfo.max_uses) {
          const { error: incrementError } = await supabase
            .from('discount_codes')
            .update({ 
              current_uses: (discountInfo.current_uses || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', discountCodeId);
          
          if (incrementError) {
            console.error('Error incrementing discount counter:', incrementError);
          } else {
            console.log('✅ Discount code counter incremented');
          }
        }
      } else {
        console.log('⚠️ Discount code already registered for this user');
      }
    }

    console.log(`Successfully verified and updated PayPal subscription for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      subscription: {
        id: subscriptionId,
        status: subscriptionData.status,
        planType: planType,
        expiresAt: expiresAt.toISOString(),
        bonusMonthsApplied: bonusMonthsApplied
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-paypal-payment:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});