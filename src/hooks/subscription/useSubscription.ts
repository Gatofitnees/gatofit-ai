
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, UserSubscription } from './types';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // Load subscription plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_usd', { ascending: true });

      if (plansError) throw plansError;
      
      setPlans(plansData || []);

      // Load user subscription
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }

        setSubscription(subData);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = subscription?.status === 'active' && 
    (subscription?.plan_type === 'monthly' || subscription?.plan_type === 'yearly');

  // Function to check if a specific user is premium (for social features)
  const checkUserPremiumStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status, plan_type')
        .eq('user_id', userId)
        .single();

      if (error) return false;
      
      return data?.status === 'active' && 
        (data?.plan_type === 'monthly' || data?.plan_type === 'yearly');
    } catch (error) {
      console.error('Error checking user premium status:', error);
      return false;
    }
  };

  const createSubscription = async (planType: 'monthly' | 'yearly') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_type: planType,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      
      setSubscription(data);
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !subscription) throw new Error('No hay suscripción activa');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', subscription.id)
        .select()
        .single();

      if (error) throw error;
      
      setSubscription(data);
      return data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  return {
    subscription,
    plans,
    isLoading,
    isPremium,
    checkUserPremiumStatus,
    createSubscription,
    cancelSubscription,
    refetch: loadSubscriptionData
  };
};
