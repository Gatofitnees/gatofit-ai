
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, UserSubscription } from './types';

export const fetchUserSubscription = async (): Promise<UserSubscription | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchUserSubscription:', error);
    return null;
  }
};

export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .in('plan_type', ['monthly', 'yearly'])
      .order('price_usd');

    if (error) throw error;
    
    const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
      ...plan,
      plan_type: plan.plan_type as 'monthly' | 'yearly',
      features: typeof plan.features === 'string' 
        ? JSON.parse(plan.features)
        : plan.features as { routines_limit: number; nutrition_photos_weekly: number; ai_chat_messages_weekly: number; }
    }));
    
    return transformedPlans;
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
};

export const checkUserPremiumStatus = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('is_user_premium', {
      user_id: user.id
    });

    if (error) throw error;
    
    return data as boolean;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

export const upgradeUserSubscription = async (planType: 'monthly' | 'yearly', transactionId?: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const plans = await fetchSubscriptionPlans();
    const plan = plans.find(p => p.plan_type === planType);
    if (!plan) throw new Error('Plan no encontrado');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingSubscription) {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_type: planType,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          store_transaction_id: transactionId,
          auto_renewal: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_type: planType,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          store_transaction_id: transactionId,
          auto_renewal: true
        });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return false;
  }
};

export const scheduleOrUpgradeSubscription = async (
  subscription: UserSubscription | null,
  planType: 'monthly' | 'yearly',
  transactionId?: string
): Promise<{ success: boolean; isScheduled: boolean }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // If user is on free plan or no subscription exists, upgrade immediately
    if (!subscription || subscription.plan_type === 'free') {
      const success = await upgradeUserSubscription(planType, transactionId);
      return { success, isScheduled: false };
    }

    // If user has premium plan, schedule the change
    const { data, error } = await supabase.rpc('schedule_plan_change', {
      p_user_id: user.id,
      p_new_plan_type: planType
    });

    if (error) throw error;

    const hadPremiumPlan = subscription.plan_type === 'monthly' || subscription.plan_type === 'yearly' || subscription.plan_type === 'asesorados';
    return { success: true, isScheduled: hadPremiumPlan };
  } catch (error) {
    console.error('Error scheduling/upgrading subscription:', error);
    return { success: false, isScheduled: false };
  }
};

export const cancelUserSubscription = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        auto_renewal: false
      })
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
};

export const cancelScheduledPlanChange = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase.rpc('cancel_scheduled_plan_change', {
      p_user_id: user.id
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error canceling scheduled plan change:', error);
    return false;
  }
};
