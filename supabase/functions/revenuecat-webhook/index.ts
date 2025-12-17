import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeo de productos RevenueCat a plan_type de Supabase
const PRODUCT_TO_PLAN: Record<string, 'monthly' | 'yearly'> = {
  // Package identifiers de RevenueCat
  '$rc_monthly': 'monthly',
  '$rc_annual': 'yearly',
  // iOS product IDs
  'SUSCRIPCION_MENSUAL': 'monthly',
  'SUSCRIPCION_ANUAL': 'yearly',
  // Android product IDs
  'gatofit_premium_monthly': 'monthly',
  'gatofit_premium_monthly:01': 'monthly',
  'gatofit_premium_yearly': 'yearly',
  'gatofit_premium_yearly:02': 'yearly',
};

// Duración en días por tipo de plan
const PLAN_DURATION_DAYS: Record<string, number> = {
  'monthly': 30,
  'yearly': 365,
};

interface RevenueCatEvent {
  api_version: string;
  event: {
    type: string;
    id: string;
    app_user_id: string;
    aliases?: string[];
    product_id: string;
    entitlement_ids?: string[];
    purchased_at_ms?: number;
    expiration_at_ms?: number;
    store: string;
    environment: string;
    original_transaction_id?: string;
    is_trial_conversion?: boolean;
    cancel_reason?: string;
    subscriber_attributes?: Record<string, { value: string }>;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Validar Authorization header
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${webhookSecret}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
      console.error('Invalid authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parsear el evento
    const body = await req.text();
    console.log('Received RevenueCat webhook:', body);
    
    let webhookData: RevenueCatEvent;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = webhookData.event;
    if (!event || !event.id || !event.type) {
      console.error('Invalid event structure:', webhookData);
      return new Response(JSON.stringify({ error: 'Invalid event structure' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing RevenueCat event: ${event.type} for user: ${event.app_user_id}`);

    // 3. Verificar idempotencia
    const { data: existingEvent } = await supabase
      .from('revenuecat_webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ message: 'Event already processed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Guardar en tabla de auditoría
    const { error: insertError } = await supabase
      .from('revenuecat_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        app_user_id: event.app_user_id,
        product_id: event.product_id,
        store: event.store,
        environment: event.environment,
        payload: webhookData,
      });

    if (insertError) {
      console.error('Failed to insert webhook event:', insertError);
      // Continuar procesando aunque falle el insert (podría ser duplicado)
    }

    // 5. Procesar según event_type
    const userId = event.app_user_id;
    
    // Validar que el userId sea un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
      console.error(`Invalid user ID format: ${userId}`);
      return new Response(JSON.stringify({ 
        message: 'Event logged but user ID is not a valid UUID',
        event_id: event.id 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determinar el plan_type basado en product_id
    const planType = PRODUCT_TO_PLAN[event.product_id] || 'monthly';
    const durationDays = PLAN_DURATION_DAYS[planType];

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION': {
        // Calcular fecha de expiración
        let expiresAt: string | null = null;
        if (event.expiration_at_ms) {
          expiresAt = new Date(event.expiration_at_ms).toISOString();
        } else {
          const expDate = new Date();
          expDate.setDate(expDate.getDate() + durationDays);
          expiresAt = expDate.toISOString();
        }

        const { error: upsertError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_type: planType,
            status: 'active',
            started_at: event.purchased_at_ms 
              ? new Date(event.purchased_at_ms).toISOString() 
              : new Date().toISOString(),
            expires_at: expiresAt,
            auto_renewal: true,
            store_platform: event.store === 'APP_STORE' ? 'ios' : 'android',
            revenuecat_original_transaction_id: event.original_transaction_id,
            // Limpiar campos de cancelación si es UNCANCELLATION
            cancelled_at: null,
            cancellation_reason: null,
            suspended_at: null,
            payment_failed_at: null,
          }, {
            onConflict: 'user_id',
          });

        if (upsertError) {
          console.error(`Failed to upsert subscription for ${event.type}:`, upsertError);
          throw upsertError;
        }
        console.log(`Successfully processed ${event.type} for user ${userId}`);
        break;
      }

      case 'CANCELLATION': {
        const { error: cancelError } = await supabase
          .from('user_subscriptions')
          .update({
            auto_renewal: false,
            cancelled_at: new Date().toISOString(),
            cancellation_reason: event.cancel_reason || 'User cancelled via store',
          })
          .eq('user_id', userId);

        if (cancelError) {
          console.error('Failed to update cancellation:', cancelError);
          throw cancelError;
        }
        console.log(`Successfully processed CANCELLATION for user ${userId}`);
        break;
      }

      case 'EXPIRATION': {
        const { error: expireError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            auto_renewal: false,
          })
          .eq('user_id', userId);

        if (expireError) {
          console.error('Failed to update expiration:', expireError);
          throw expireError;
        }
        console.log(`Successfully processed EXPIRATION for user ${userId}`);
        break;
      }

      case 'BILLING_ISSUE': {
        const { error: billingError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'payment_failed',
            payment_failed_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (billingError) {
          console.error('Failed to update billing issue:', billingError);
          throw billingError;
        }
        console.log(`Successfully processed BILLING_ISSUE for user ${userId}`);
        break;
      }

      case 'PRODUCT_CHANGE': {
        // Calcular nueva fecha de expiración
        let expiresAt: string | null = null;
        if (event.expiration_at_ms) {
          expiresAt = new Date(event.expiration_at_ms).toISOString();
        }

        const { error: changeError } = await supabase
          .from('user_subscriptions')
          .update({
            plan_type: planType,
            expires_at: expiresAt,
            // Limpiar campos de cambio programado si existían
            next_plan_type: null,
            next_plan_starts_at: null,
            scheduled_change_created_at: null,
          })
          .eq('user_id', userId);

        if (changeError) {
          console.error('Failed to update product change:', changeError);
          throw changeError;
        }
        console.log(`Successfully processed PRODUCT_CHANGE for user ${userId} to ${planType}`);
        break;
      }

      case 'SUBSCRIBER_ALIAS':
      case 'TRANSFER': {
        // Eventos informativos, solo logueamos
        console.log(`Received ${event.type} event for user ${userId}, no action needed`);
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Event ${event.type} processed successfully`,
      event_id: event.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error);
    // Responder 200 para evitar reintentos infinitos de RevenueCat
    return new Response(JSON.stringify({ 
      error: 'Internal error', 
      message: error.message 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
