
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Sparkles, Loader2, AlertCircle, XCircle, Info } from 'lucide-react';
import Button from '@/components/Button';
import { useSubscription, type CancelScheduledChangeResult } from '@/hooks/subscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { UsageLimitsBanner } from '@/components/premium/UsageLimitsBanner';
import { PremiumPlanCard } from '@/components/subscription/PremiumPlanCard';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { PlanChangeConfirmDialog } from '@/components/subscription/PlanChangeConfirmDialog';
import { CancelConfirmDialog } from '@/components/subscription/CancelConfirmDialog';
import { ScheduledChangeCard } from '@/components/subscription/ScheduledChangeCard';
import { PaymentFailureAlert } from '@/components/subscription/PaymentFailureAlert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    subscription, 
    plans, 
    isPremium, 
    hasScheduledChange,
    upgradeSubscription, 
    cancelSubscription,
    cancelScheduledPlanChange
  } = useSubscription();
  const { usage } = useUsageLimits();
  const [isLoading, setIsLoading] = useState(false);
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [paymentFailure, setPaymentFailure] = useState<any>(null);

  const monthlyPlan = plans.find(p => p.plan_type === 'monthly');
  const yearlyPlan = plans.find(p => p.plan_type === 'yearly');

  // Fetch payment failure info if subscription status is payment_failed
  useEffect(() => {
    const fetchPaymentFailure = async () => {
      if (subscription?.status === 'payment_failed') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('subscription_payment_failures')
          .select('*')
          .eq('user_id', user.id)
          .is('resolved_at', null)
          .order('failed_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setPaymentFailure(data);
        }
      } else {
        setPaymentFailure(null);
      }
    };

    fetchPaymentFailure();
  }, [subscription?.status]);

  // Detectar retorno de PayPal y verificar pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const subscriptionId = urlParams.get('subscription_id') || urlParams.get('ba_token');
    
    if (success === 'true' && subscriptionId && !isLoading) {
      handlePayPalReturn(subscriptionId);
    }
  }, []);

  const handlePayPalReturn = async (subscriptionId: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Recuperar código de descuento del localStorage si existe
      const discountCode = localStorage.getItem('pending_discount_code');
      
      const { data, error } = await supabase.functions.invoke('verify-paypal-payment', {
        body: {
          subscriptionId,
          userId: user.id,
          discountCode: discountCode || undefined
        }
      });

      // Limpiar localStorage
      localStorage.removeItem('pending_discount_code');
      localStorage.removeItem('pending_subscription_id');

      if (error) throw error;

      if (data?.success) {
        const bonusMessage = data.subscription?.bonusMonthsApplied 
          ? ` ¡Incluye ${data.subscription.bonusMonthsApplied} meses gratis!`
          : '';
        
        toast({
          title: "¡Pago confirmado!",
          description: `Tu suscripción premium ha sido activada exitosamente.${bonusMessage}`,
        });
        
        // Limpiar URL y recargar datos
        window.history.replaceState({}, '', '/subscription');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error(data?.error || 'Error al verificar pago');
      }
    } catch (error) {
      console.error('Error verifying PayPal payment:', error);
      toast({
        title: "Error",
        description: "No pudimos confirmar tu pago. Contacta soporte si el problema persiste.",
        variant: "destructive"
      });
      
      // Limpiar URL incluso si hay error
      window.history.replaceState({}, '', '/subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelection = async (planType: 'monthly' | 'yearly') => {
    // Si ya tiene este plan activo, no hacer nada
    if (subscription?.plan_type === planType && subscription?.status === 'active') {
      toast({
        title: "Plan actual",
        description: "Ya tienes este plan activo. Selecciona el otro plan para cambiar.",
        variant: "default"
      });
      return;
    }

    // VALIDACIÓN: Bloquear downgrade de Anual a Mensual
    if (subscription?.plan_type === 'yearly' && planType === 'monthly' && subscription?.status === 'active') {
      toast({
        title: "Cambio no disponible",
        description: "No puedes cambiar de plan Anual a Mensual. Tu plan actual continuará hasta su fecha de expiración.",
        variant: "default"
      });
      return;
    }

    // If user already has a premium plan, handle accordingly
    if (isPremium && subscription?.status === 'active') {
      // Plan diferente - mostrar diálogo para cambio inmediato (Mensual -> Anual)
      setSelectedPlan(planType);
      setShowPlanChangeDialog(true);
    } else {
      // Direct upgrade for free users
      await handleDirectUpgrade(planType);
    }
  };

  const handleDirectUpgrade = async (planType: 'monthly' | 'yearly') => {
    setIsLoading(true);
    try {
      const success = await upgradeSubscription(planType);
      if (success) {
        // Success message is already shown by the hook
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    try {
      const success = await upgradeSubscription(selectedPlan);
      if (success) {
        setShowPlanChangeDialog(false);
        setSelectedPlan(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      // Check if already cancelled
      if (subscription?.auto_renewal === false) {
        toast({
          title: "Suscripción ya cancelada",
          description: "Tu suscripción ya fue cancelada anteriormente",
          variant: "default"
        });
        setShowCancelDialog(false);
        setIsLoading(false);
        return;
      }

      // Try to cancel in PayPal if has subscription ID
      if (subscription?.paypal_subscription_id) {
        const { data, error } = await supabase.functions.invoke('cancel-paypal-subscription', {
          body: {
            subscriptionId: subscription.paypal_subscription_id,
            reason: 'User requested cancellation'
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw new Error('No se pudo comunicar con el servidor de pagos');
        }

        if (data?.success) {
          toast({
            title: "Suscripción cancelada",
            description: data.message || "Tu suscripción ha sido cancelada exitosamente",
          });
          
          // Reload to update subscription status
          window.location.reload();
        } else {
          throw new Error(data?.error || 'Error desconocido al cancelar');
        }
      } else {
        // Fallback: cancel only in local DB
        await cancelSubscription();
        window.location.reload();
      }
      
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error al cancelar",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    try {
      if (!subscription?.paypal_subscription_id) {
        toast({
          title: "Error",
          description: "No se encontró información de la suscripción",
          variant: "destructive"
        });
        return;
      }

      // Validar si la suscripción ha expirado
      if (subscription?.expires_at && new Date(subscription.expires_at) < new Date()) {
        toast({
          title: "Suscripción expirada",
          description: "Tu suscripción ha expirado. Necesitas crear una nueva suscripción.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('activate-paypal-subscription', {
        body: {
          subscriptionId: subscription.paypal_subscription_id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('No se pudo comunicar con el servidor de pagos');
      }

      if (data?.success) {
        toast({
          title: "Suscripción reactivada",
          description: "Tu suscripción ha sido reactivada exitosamente",
        });
        
        window.location.reload();
      } else if (data?.error === 'expired') {
        toast({
          title: "Suscripción expirada",
          description: "Tu suscripción ha expirado. Necesitas crear una nueva suscripción.",
          variant: "destructive"
        });
      } else if (data?.error === 'cancelled') {
        toast({
          title: "Suscripción cancelada",
          description: "Esta suscripción fue cancelada permanentemente. Por favor, selecciona un nuevo plan abajo.",
          variant: "destructive"
        });
        // Scroll to plans section
        setTimeout(() => {
          const plansSection = document.querySelector('[data-plans-section]');
          if (plansSection) {
            plansSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      } else {
        throw new Error(data?.error || 'Error desconocido al reactivar');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Error al reactivar",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelScheduledChange = async () => {
    setIsLoading(true);
    try {
      // Primero cancelar el cambio programado en la BD y obtener el PayPal ID
      const result: CancelScheduledChangeResult = await cancelScheduledPlanChange();
      
      if (!result.success) {
        throw new Error('Failed to cancel scheduled change');
      }

      // Si hay un paypal_subscription_id asociado al cambio programado, cancelarlo en PayPal
      if (result.paypalSubscriptionId) {
        console.log('Cancelling scheduled PayPal subscription:', result.paypalSubscriptionId);
        
        try {
          const { data, error } = await supabase.functions.invoke('cancel-paypal-subscription', {
            body: {
              subscriptionId: result.paypalSubscriptionId,
              reason: 'User cancelled scheduled plan change'
            }
          });

          if (error) {
            console.error('Error cancelling PayPal subscription:', error);
            toast({
              title: "Cambio cancelado con advertencia",
              description: "El cambio fue cancelado pero no se pudo procesar el reembolso de PayPal automáticamente. Contacta soporte.",
              variant: "default"
            });
            return;
          }
          
          if (data?.success) {
            console.log('✅ PayPal subscription cancelled successfully');
          }
        } catch (paypalError) {
          console.error('Error in PayPal cancellation:', paypalError);
          toast({
            title: "Cambio cancelado con advertencia",
            description: "El cambio fue cancelado pero hubo un problema con PayPal. Contacta soporte.",
            variant: "default"
          });
          return;
        }
      }
      
      toast({
        title: "Cambio cancelado",
        description: "El cambio de plan ha sido cancelado y se procesará el reembolso correspondiente",
      });
    } catch (error) {
      console.error('Error cancelling scheduled change:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar el cambio programado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Suscripción
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Verificando pago de PayPal */}
        {isLoading && new URLSearchParams(window.location.search).get('success') === 'true' && (
          <div className="neu-card p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">Verificando tu pago...</p>
          </div>
        )}

        {/* Payment Failure Alert */}
        {subscription?.status === 'payment_failed' && paymentFailure && (
          <PaymentFailureAlert
            gracePeriodEndsAt={paymentFailure.grace_period_ends_at}
          />
        )}

        {/* Current Status */}
        <SubscriptionStatus subscription={subscription} isPremium={isPremium} />

        {/* Scheduled Change Card */}
        {hasScheduledChange && (
          <ScheduledChangeCard
            subscription={subscription!}
            plans={plans}
            onCancelScheduledChange={handleCancelScheduledChange}
            isLoading={isLoading}
          />
        )}

        {/* Usage Stats for Free Users */}
        {!isPremium && usage && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Uso actual</h3>
            </div>
            <div className="space-y-3">
              <UsageLimitsBanner type="routines" />
              <UsageLimitsBanner type="nutrition" />
              <UsageLimitsBanner type="ai_chat" />
            </div>
          </div>
        )}

        {/* Premium Benefits Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold">
              {isPremium ? 'Planes Premium' : 'Beneficios Premium'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {isPremium ? 
              'Cambia tu plan cuando quieras' : 
              'Desbloquea todo el potencial de tu entrenamiento'
            }
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-4" data-plans-section>
          {/* Yearly Plan - Recommended */}
          {yearlyPlan && (
            <PremiumPlanCard
              plan={yearlyPlan}
              isRecommended={!isPremium}
              onSelect={handlePlanSelection}
              isLoading={isLoading}
              isCurrentPlan={subscription?.plan_type === 'yearly' && subscription?.status === 'active'}
              onPayPalSuccess={() => {
                // Refetch subscription data after PayPal payment
                window.location.reload();
              }}
            />
          )}

          {/* Monthly Plan */}
          {monthlyPlan && (
            <PremiumPlanCard
              plan={monthlyPlan}
              onSelect={handlePlanSelection}
              isLoading={isLoading}
              discountText="Flexible"
              isCurrentPlan={subscription?.plan_type === 'monthly' && subscription?.status === 'active'}
              isDisabled={subscription?.plan_type === 'yearly' && subscription?.status === 'active'}
              disabledReason="No puedes cambiar de Anual a Mensual"
              onPayPalSuccess={() => {
                // Refetch subscription data after PayPal payment
                window.location.reload();
              }}
            />
          )}
        </div>

        {/* Cancel Subscription Section */}
        {isPremium && subscription?.status === 'active' && subscription?.auto_renewal === true && (
          <div className="neu-card p-6 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-semibold text-base mb-1">Cancelar suscripción</h3>
                  <p className="text-sm text-muted-foreground">
                    Si cancelas tu suscripción, seguirás teniendo acceso premium hasta la fecha de expiración.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar suscripción
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Already Cancelled - Not Expired Yet */}
        {isPremium && 
         subscription?.status === 'active' && 
         subscription?.auto_renewal === false && 
         subscription?.expires_at && 
         new Date(subscription.expires_at) > new Date() && (
          <div className="neu-card p-6 border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-3 flex-1">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Suscripción cancelada</h3>
                  <p className="text-sm text-muted-foreground">
                    Tu suscripción ya fue cancelada y no se renovará automáticamente.
                    Seguirás teniendo acceso premium hasta {new Date(subscription.expires_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ¿Cambiaste de opinión? Puedes reactivar tu suscripción ahora.
                  </p>
                </div>
                {subscription?.paypal_subscription_id && (
                  <Button
                    variant="primary"
                    onClick={handleReactivateSubscription}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Reactivando...
                      </>
                    ) : (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Reactivar suscripción
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Expired or Cancelled and Expired - Renew Section */}
        {((subscription?.status === 'expired') || 
          (subscription?.status === 'active' && 
           subscription?.auto_renewal === false && 
           subscription?.expires_at && 
           new Date(subscription.expires_at) <= new Date())) && (
          <div className="neu-card p-6 border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-3 flex-1">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Renovar suscripción</h3>
                  <p className="text-sm text-muted-foreground">
                    Tu suscripción ha expirado. Para volver a disfrutar de los beneficios premium, selecciona un nuevo plan arriba.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground space-y-2 pt-4">
          <div className="flex items-center justify-center gap-1">
            <Crown className="h-3 w-3 text-yellow-500" />
            <span>Los pagos se procesan de forma segura</span>
          </div>
          <p>Cancela en cualquier momento desde la configuración de tu cuenta.</p>
        </div>
      </div>

      {/* Plan Change Confirmation Dialog */}
      <PlanChangeConfirmDialog
        isOpen={showPlanChangeDialog}
        onClose={() => {
          setShowPlanChangeDialog(false);
          setSelectedPlan(null);
        }}
        onConfirm={handleConfirmPlanChange}
        currentPlan={subscription?.plan_type === 'monthly' ? monthlyPlan : yearlyPlan}
        newPlan={selectedPlan === 'monthly' ? monthlyPlan : yearlyPlan}
        expirationDate={subscription?.expires_at || null}
        isLoading={isLoading}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelSubscription}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SubscriptionPage;
