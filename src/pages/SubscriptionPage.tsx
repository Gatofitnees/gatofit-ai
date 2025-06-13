
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { UsageLimitsBanner } from '@/components/premium/UsageLimitsBanner';
import { PremiumPlanCard } from '@/components/subscription/PremiumPlanCard';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { subscription, plans, isPremium, upgradeSubscription, cancelSubscription } = useSubscription();
  const { usage } = useUsageLimits();
  const [isLoading, setIsLoading] = useState(false);

  const monthlyPlan = plans.find(p => p.plan_type === 'monthly');
  const yearlyPlan = plans.find(p => p.plan_type === 'yearly');

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
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

  const handleReactivate = async () => {
    if (subscription) {
      await handleUpgrade(subscription.plan_type);
    }
  };

  const handleChangePlan = async () => {
    if (subscription) {
      const newPlanType = subscription.plan_type === 'monthly' ? 'yearly' : 'monthly';
      await handleUpgrade(newPlanType);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
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

        {/* Subscription Management */}
        <SubscriptionManager
          subscription={subscription}
          onReactivate={handleReactivate}
          onChangePlan={handleChangePlan}
          isLoading={isLoading}
        />

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
            <h2 className="text-xl font-bold">Beneficios Premium</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Desbloquea todo el potencial de tu entrenamiento
          </p>
        </div>

        {/* Subscription Plans */}
        {!isPremium && (
          <div className="space-y-4">
            {/* Yearly Plan - Recommended */}
            {yearlyPlan && (
              <PremiumPlanCard
                plan={yearlyPlan}
                isRecommended={true}
                onSelect={handleUpgrade}
                isLoading={isLoading}
              />
            )}

            {/* Monthly Plan */}
            {monthlyPlan && (
              <PremiumPlanCard
                plan={monthlyPlan}
                onSelect={handleUpgrade}
                isLoading={isLoading}
                discountText="Flexible"
              />
            )}
          </div>
        )}

        {/* Cancel Subscription */}
        {isPremium && subscription?.status === 'active' && (
          <div className="neu-card p-6 border border-red-500/20">
            <h3 className="text-lg font-semibold mb-3 text-center">Gestionar suscripción</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Si cancelas tu suscripción, seguirás teniendo acceso a las funciones premium hasta que expire.
            </p>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              {isLoading ? 'Cancelando...' : 'Cancelar suscripción'}
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
    </div>
  );
};

export default SubscriptionPage;
