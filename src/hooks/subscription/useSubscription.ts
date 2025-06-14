
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionPlan, UserSubscription } from './types';
import {
  fetchUserSubscription,
  fetchSubscriptionPlans,
  checkUserPremiumStatus,
  scheduleOrUpgradeSubscription,
  cancelUserSubscription,
  cancelScheduledPlanChange
} from './subscriptionService';

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
      const data = await fetchUserSubscription();
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
    const data = await fetchSubscriptionPlans();
    setPlans(data);
  };

  const checkPremiumStatus = async () => {
    const premium = await checkUserPremiumStatus();
    setIsPremium(premium);
    return premium;
  };

  const upgradeSubscription = async (planType: 'monthly' | 'yearly', transactionId?: string) => {
    setIsLoading(true);
    try {
      const plan = plans.find(p => p.plan_type === planType);
      if (!plan) throw new Error('Plan no encontrado');

      const { success, isScheduled } = await scheduleOrUpgradeSubscription(subscription, planType, transactionId);
      
      if (success) {
        await fetchSubscriptionData();
        
        toast({
          title: isScheduled ? "¡Cambio de plan programado!" : "¡Suscripción actualizada!",
          description: isScheduled 
            ? `Tu cambio al ${plan.name} se aplicará cuando expire tu plan actual`
            : `Ahora tienes acceso al ${plan.name}`,
        });
      }

      return success;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar el cambio de plan",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    const success = await cancelUserSubscription();
    
    if (success) {
      await fetchSubscriptionData();
      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción se ha cancelado correctamente",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción",
        variant: "destructive"
      });
    }

    return success;
  };

  const handleCancelScheduledPlanChange = async () => {
    const success = await cancelScheduledPlanChange();
    
    if (success) {
      await fetchSubscriptionData();
      toast({
        title: "Cambio cancelado",
        description: "Se ha cancelado el cambio de plan programado",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo cancelar el cambio programado",
        variant: "destructive"
      });
    }

    return success;
  };

  const hasScheduledChange = subscription?.next_plan_type && subscription?.next_plan_starts_at;

  return {
    subscription,
    plans,
    isLoading,
    isPremium,
    hasScheduledChange,
    checkPremiumStatus,
    upgradeSubscription,
    cancelSubscription,
    cancelScheduledPlanChange: handleCancelScheduledPlanChange,
    refetch: fetchSubscriptionData
  };
};
