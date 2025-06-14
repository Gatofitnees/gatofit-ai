
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_usd: number;
  duration_days: number;
  plan_type: 'free' | 'monthly' | 'yearly';
  features: any;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'trial';
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  auto_renewal: boolean;
  cancelled_at: string | null;
  store_platform: string | null;
  store_transaction_id: string | null;
  next_plan_type: 'monthly' | 'yearly' | null;
  next_plan_starts_at: string | null;
  scheduled_change_created_at: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        // Transform the data to match our interface
        const transformedData: UserSubscription = {
          ...data,
          next_plan_type: data.next_plan_type === 'free' ? null : data.next_plan_type
        };
        setSubscription(transformedData);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_usd', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        return;
      }

      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const upgradeSubscription = async (planType: 'monthly' | 'yearly') => {
    if (!user) {
      toast.error('Debes estar autenticado para cambiar de plan');
      return false;
    }

    try {
      const plan = plans.find(p => p.plan_type === planType);
      if (!plan) {
        toast.error('Plan no encontrado');
        return false;
      }

      // Check if user has an active subscription
      if (subscription && subscription.status === 'active' && subscription.expires_at) {
        // Schedule the plan change instead of changing immediately
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            next_plan_type: planType,
            next_plan_starts_at: subscription.expires_at,
            scheduled_change_created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (error) {
          console.error('Error scheduling plan change:', error);
          toast.error('Error al programar el cambio de plan');
          return false;
        }

        toast.success(`Plan ${plan.name} programado para ${new Date(subscription.expires_at).toLocaleDateString()}`);
        await fetchSubscription(); // Refresh subscription data
        return true;
      } else {
        // Create new subscription or update expired one
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

        const subscriptionData = {
          user_id: user.id,
          plan_type: planType,
          status: 'active' as const,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          auto_renewal: true,
          updated_at: new Date().toISOString()
        };

        const { error } = subscription?.id
          ? await supabase
              .from('user_subscriptions')
              .update(subscriptionData)
              .eq('id', subscription.id)
          : await supabase
              .from('user_subscriptions')
              .insert([subscriptionData]);

        if (error) {
          console.error('Error updating subscription:', error);
          toast.error('Error al actualizar la suscripción');
          return false;
        }

        toast.success(`¡Plan ${plan.name} activado con éxito!`);
        await fetchSubscription();
        return true;
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Error al cambiar de plan');
      return false;
    }
  };

  const cancelScheduledChange = async () => {
    if (!user || !subscription?.next_plan_type) {
      toast.error('No hay cambio programado para cancelar');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          next_plan_type: null,
          next_plan_starts_at: null,
          scheduled_change_created_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) {
        console.error('Error cancelling scheduled change:', error);
        toast.error('Error al cancelar el cambio programado');
        return false;
      }

      toast.success('Cambio programado cancelado exitosamente');
      await fetchSubscription();
      return true;
    } catch (error) {
      console.error('Error cancelling scheduled change:', error);
      toast.error('Error al cancelar el cambio programado');
      return false;
    }
  };

  const cancelSubscription = async () => {
    if (!user || !subscription) {
      toast.error('No hay suscripción para cancelar');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          auto_renewal: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) {
        console.error('Error cancelling subscription:', error);
        toast.error('Error al cancelar la suscripción');
        return false;
      }

      toast.success('Suscripción cancelada exitosamente');
      await fetchSubscription();
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Error al cancelar la suscripción');
      return false;
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, [user]);

  const isPremium = subscription?.status === 'active' && 
    (subscription?.plan_type === 'monthly' || subscription?.plan_type === 'yearly');

  return {
    subscription,
    plans,
    isLoading,
    isPremium,
    upgradeSubscription,
    cancelSubscription,
    cancelScheduledChange,
    refetch: fetchSubscription
  };
};
