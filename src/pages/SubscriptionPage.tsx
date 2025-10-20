
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import { useSubscription } from '@/hooks/subscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { UsageLimitsBanner } from '@/components/premium/UsageLimitsBanner';
import { PremiumPlanCard } from '@/components/subscription/PremiumPlanCard';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { PlanChangeConfirmDialog } from '@/components/subscription/PlanChangeConfirmDialog';
import { CancelConfirmDialog } from '@/components/subscription/CancelConfirmDialog';
import { ScheduledChangeCard } from '@/components/subscription/ScheduledChangeCard';
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

  const monthlyPlan = plans.find(p => p.plan_type === 'monthly');
  const yearlyPlan = plans.find(p => p.plan_type === 'yearly');

  const handlePlanSelection = async (planType: 'monthly' | 'yearly') => {
    // If user already has a premium plan, show confirmation dialog
    if (isPremium && subscription?.status === 'active') {
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
      // If subscription has PayPal ID, cancel via PayPal
      if (subscription?.paypal_subscription_id) {
        const { data, error } = await supabase.functions.invoke('cancel-paypal-subscription', {
          body: {
            subscriptionId: subscription.paypal_subscription_id,
            reason: 'User requested cancellation'
          }
        });

        if (error) throw error;

        if (data?.success) {
          toast({
            title: "Suscripción cancelada",
            description: data.message || "Tu suscripción ha sido cancelada exitosamente",
          });
          
          // Reload to update subscription status
          window.location.reload();
        } else {
          throw new Error(data?.error || 'Error al cancelar suscripción');
        }
      } else {
        // Fallback to regular cancellation
        await cancelSubscription();
      }
      
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelScheduledChange = async () => {
    setIsLoading(true);
    try {
      await cancelScheduledPlanChange();
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
        <div className="space-y-4">
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
              onPayPalSuccess={() => {
                // Refetch subscription data after PayPal payment
                window.location.reload();
              }}
            />
          )}
        </div>

        {/* Cancel Subscription */}
        {isPremium && subscription?.status === 'active' && (
          <div className="neu-card p-6 border border-red-500/20">
            <h3 className="text-lg font-semibold mb-3 text-center">Gestionar suscripción</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Si cancelas tu suscripción, seguirás teniendo acceso a las funciones premium hasta que expire.
            </p>
            <Button
              variant="secondary"
              onClick={() => setShowCancelDialog(true)}
              disabled={isLoading}
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Cancelar suscripción
            </Button>
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
