import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePayPalSubscription = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const createPayPalSubscription = async (planType: 'monthly' | 'yearly' | 'test_daily') => {
    try {
      setIsCreating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
        body: { 
          planType,
          userId: user.id 
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error al crear la suscripción de PayPal');
      }

      return {
        success: true,
        subscriptionId: data.subscriptionId,
        approvalUrl: data.approvalUrl
      };

    } catch (error) {
      console.error('Error creating PayPal subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la suscripción de PayPal",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsCreating(false);
    }
  };

  const verifyPayPalPayment = async (subscriptionId: string, discountCode?: string) => {
    try {
      setIsVerifying(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase.functions.invoke('verify-paypal-payment', {
        body: { 
          subscriptionId,
          userId: user.id,
          discountCode: discountCode
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      // Manejar tanto activación inmediata como programación
      if (data.scheduled) {
        toast({
          title: "¡Cambio de plan programado!",
          description: data.subscription.message,
        });
      } else {
        const bonusMessage = data.subscription?.bonusMonthsApplied 
          ? ` ¡Incluye ${data.subscription.bonusMonthsApplied} meses gratis!`
          : '';
        
        toast({
          title: "¡Pago verificado!",
          description: `Tu suscripción ha sido activada exitosamente.${bonusMessage}`,
        });
      }

      return {
        success: true,
        scheduled: data.scheduled,
        subscription: data.subscription
      };

    } catch (error) {
      console.error('Error verifying PayPal payment:', error);
      return { success: false, error: error.message };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    createPayPalSubscription,
    verifyPayPalPayment,
    isCreating,
    isVerifying
  };
};