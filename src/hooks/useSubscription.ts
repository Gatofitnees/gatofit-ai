import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  plan_type: 'monthly' | 'yearly';
  name: string;
  price_usd: number;
  duration_days: number;
  features: {
    routines_limit: number;
    nutrition_photos_weekly: number;
    ai_chat_messages_weekly: number;
  };
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'monthly' | 'yearly' | 'asesorados';
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'trial' | 'suspended';
  started_at: string;
  expires_at?: string;
  store_transaction_id?: string;
  store_platform?: string;
  auto_renewal: boolean;
  next_plan_type?: 'free' | 'monthly' | 'yearly' | 'asesorados';
  next_plan_starts_at?: string;
  scheduled_change_created_at?: string;
  suspended_at?: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isAsesorado, setIsAsesorado] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionData();
    fetchPlans();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        setSubscription(data as UserSubscription);
        const planType = data.plan_type as string;
        const isActiveAsesorado = planType === 'asesorados' && data.status === 'active';
        setIsAsesorado(isActiveAsesorado);
        setIsPremium((planType === 'monthly' || planType === 'yearly' || planType === 'asesorados') && data.status === 'active');
      }
    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error);
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
  };

  const checkPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('is_user_premium', {
        user_id: user.id
      });

      if (error) throw error;
      
      const premium = data as boolean;
      setIsPremium(premium);
      return premium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  };

  const checkUserPremiumStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status, plan_type')
        .eq('user_id', userId)
        .single();

      if (error) return false;
      
      return data?.status === 'active' && 
        (data?.plan_type === 'monthly' || data?.plan_type === 'yearly' || (data?.plan_type as any) === 'asesorados');
    } catch (error) {
      console.error('Error checking user premium status:', error);
      return false;
    }
  };

  const scheduleOrUpgradeSubscription = async (planType: 'monthly' | 'yearly' | 'asesorados', transactionId?: string) => {
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
        p_new_plan_type: planType as any
      });

      if (error) throw error;

      await fetchSubscriptionData();
      
      const hadPremiumPlan = subscription.plan_type === 'monthly' || subscription.plan_type === 'yearly' || subscription.plan_type === 'asesorados';
      
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

  const upgradeSubscription = async (planType: 'monthly' | 'yearly' | 'asesorados', transactionId?: string) => {
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
            plan_type: planType as any,
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
            plan_type: planType as any,
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
    isAsesorado,
    hasScheduledChange,
    checkPremiumStatus,
    checkUserPremiumStatus,
    upgradeSubscription: scheduleOrUpgradeSubscription,
    cancelSubscription,
    cancelScheduledPlanChange,
    refetch: fetchSubscriptionData
  };
};
