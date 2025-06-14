import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  plan_type: 'free' | 'monthly' | 'yearly';
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
  plan_type: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'trial';
  started_at: string;
  expires_at?: string;
  store_transaction_id?: string;
  store_platform?: string;
  auto_renewal: boolean;
  next_plan_type?: 'monthly' | 'yearly';
  next_plan_starts_at?: string;
  scheduled_change_created_at?: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
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
        setSubscription(data);
        setIsPremium(data.plan_type !== 'free' && data.status === 'active');
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
        .order('price_usd');

      if (error) throw error;
      
      // Transform the data to match our SubscriptionPlan interface
      const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' 
          ? JSON.parse(plan.features)
          : plan.features as { routines_limit: number; nutrition_photos_weekly: number; ai_chat_messages_used: number; }
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

  const upgradeSubscription = async (planType: 'monthly' | 'yearly', transactionId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const plan = plans.find(p => p.plan_type === planType);
      if (!plan) throw new Error('Plan no encontrado');

      // Check if user already has an active subscription
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If user has an active premium subscription, schedule the change instead of immediate upgrade
      if (existingSubscription && 
          existingSubscription.status === 'active' && 
          existingSubscription.plan_type !== 'free' &&
          existingSubscription.expires_at) {
        
        // Schedule plan change for when current plan expires
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            next_plan_type: planType,
            next_plan_starts_at: existingSubscription.expires_at,
            scheduled_change_created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;

        await fetchSubscriptionData();
        
        toast({
          title: "¡Cambio de plan programado!",
          description: `Tu plan cambiará a ${plan.name} cuando expire tu suscripción actual`,
        });

        return true;
      }

      // For free users or expired subscriptions, proceed with immediate upgrade
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

      if (existingSubscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            plan_type: planType,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            store_transaction_id: transactionId,
            auto_renewal: true,
            next_plan_type: null,
            next_plan_starts_at: null,
            scheduled_change_created_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new subscription
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
      
      toast({
        title: "¡Suscripción actualizada!",
        description: `Ahora tienes acceso al ${plan.name}`,
      });

      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la suscripción",
        variant: "destructive"
      });
      return false;
    }
  };

  const cancelScheduledChange = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          next_plan_type: null,
          next_plan_starts_at: null,
          scheduled_change_created_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSubscriptionData();
      
      toast({
        title: "Cambio cancelado",
        description: "El cambio de plan programado ha sido cancelado",
      });

      return true;
    } catch (error) {
      console.error('Error canceling scheduled change:', error);
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

  return {
    subscription,
    plans,
    isLoading,
    isPremium,
    checkPremiumStatus,
    upgradeSubscription,
    cancelSubscription,
    cancelScheduledChange,
    refetch: fetchSubscriptionData
  };
};
