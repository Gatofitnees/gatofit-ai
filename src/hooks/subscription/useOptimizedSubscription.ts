import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionCache } from './useSubscriptionCache';
import type { SubscriptionPlan, UserSubscription } from './types';

export const useOptimizedSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();
  const { checkUserPremiumStatus: checkCachedPremiumStatus } = useSubscriptionCache();

  const fetchSubscriptionData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Intentar obtener suscripción existente
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        
        // Si hay error, asegurar que el usuario tenga una suscripción
        const { error: ensureError } = await supabase.rpc('ensure_user_subscription', {
          p_user_id: user.id
        });
        
        if (ensureError) {
          console.error('Error ensuring subscription:', ensureError);
        } else {
          // Reintentar obtener la suscripción
          const { data: retryData } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (retryData) {
            setSubscription(retryData);
            setIsPremium(retryData.plan_type !== 'free' && retryData.status === 'active');
          }
        }
        return;
      }

      if (data) {
        setSubscription(data);
        setIsPremium(data.plan_type !== 'free' && data.status === 'active');
      } else {
        // No existe suscripción, crear una
        await supabase.rpc('ensure_user_subscription', {
          p_user_id: user.id
        });
        
        // Obtener la suscripción recién creada
        const { data: newData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (newData) {
          setSubscription(newData);
          setIsPremium(false); // Nueva suscripción siempre es free
        }
      }
    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .in('plan_type', ['monthly', 'yearly'])
        .order('price_usd');

      if (error) throw error;
      
      const transformedPlans: SubscriptionPlan[] = (data || [])
        .filter(plan => plan.plan_type !== 'free')
        .map(plan => ({
          ...plan,
          plan_type: plan.plan_type as 'monthly' | 'yearly',
          features: typeof plan.features === 'string' 
            ? JSON.parse(plan.features)
            : plan.features as { routines_limit: number; nutrition_photos_weekly: number; ai_chat_messages_weekly: number; }
        }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
    fetchPlans();
  }, [fetchSubscriptionData, fetchPlans]);

  const checkPremiumStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const premium = await checkCachedPremiumStatus(user.id);
      setIsPremium(premium);
      return premium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }, [checkCachedPremiumStatus]);

  // Resto de funciones mantenidas igual
  const scheduleOrUpgradeSubscription = async (planType: 'monthly' | 'yearly', transactionId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const plan = plans.find(p => p.plan_type === planType);
      if (!plan) throw new Error('Plan no encontrado');

      if (!subscription || subscription.plan_type === 'free') {
        return await upgradeSubscription(planType, transactionId);
      }

      const { data, error } = await supabase.rpc('schedule_plan_change', {
        p_user_id: user.id,
        p_new_plan_type: planType
      });

      if (error) throw error;

      await fetchSubscriptionData();
      
      const hadPremiumPlan = subscription.plan_type === 'monthly' || subscription.plan_type === 'yearly';
      
      toast({
        title: hadPremiumPlan ? "¡Cambio de plan programado!" : "¡Suscripción actualizada!",
        description: hadPremiumPlan 
          ? `Tu cambio al ${plan.name} se aplicará cuando expire tu plan actual`
          : `Ahora tienes acceso al ${plan.name}`,
      });

      return true;
    } catch (error) {
      console.error('Error scheduling/upgrading subscription:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar el cambio de plan",
        variant: "destructive"
      });
      return false;
    }
  };

  const upgradeSubscription = async (planType: 'monthly' | 'yearly', transactionId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

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

      await fetchSubscriptionData();
      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return false;
    }
  };

  const cancelScheduledPlanChange = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase.rpc('cancel_scheduled_plan_change', {
        p_user_id: user.id
      });

      if (error) throw error;

      await fetchSubscriptionData();
      
      toast({
        title: "Cambio cancelado",
        description: "Se ha cancelado el cambio de plan programado",
      });

      return true;
    } catch (error) {
      console.error('Error canceling scheduled plan change:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar el cambio programado",
        variant: "destructive"
      });
      return false;
    }
  };

  const cancelSubscription = async () => {
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

      await fetchSubscriptionData();
      
      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción se ha cancelado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción",
        variant: "destructive"
      });
      return false;
    }
  };

  const hasScheduledChange = subscription?.next_plan_type && subscription?.next_plan_starts_at;

  return {
    subscription,
    plans,
    isLoading,
    isPremium,
    hasScheduledChange,
    checkPremiumStatus,
    checkUserPremiumStatus: checkCachedPremiumStatus,
    upgradeSubscription: scheduleOrUpgradeSubscription,
    cancelSubscription,
    cancelScheduledPlanChange,
    refetch: fetchSubscriptionData
  };
};
