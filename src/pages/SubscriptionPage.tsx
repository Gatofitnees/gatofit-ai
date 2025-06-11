
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Check, Calendar, Zap } from 'lucide-react';
import Button from '@/components/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { UsageLimitsBanner } from '@/components/premium/UsageLimitsBanner';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { subscription, plans, isPremium, upgradeSubscription, cancelSubscription } = useSubscription();
  const { usage } = useUsageLimits();

  const monthlyPlan = plans.find(p => p.plan_type === 'monthly');
  const yearlyPlan = plans.find(p => p.plan_type === 'yearly');

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    const success = await upgradeSubscription(planType);
    if (success) {
      // Show success message or redirect
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const premiumFeatures = [
    {
      icon: Zap,
      title: 'Rutinas ilimitadas',
      description: 'Crea todas las rutinas que necesites sin restricciones'
    },
    {
      icon: Calendar,
      title: 'Análisis nutricional ilimitado',
      description: 'Escanea todas las comidas que quieras cada semana'
    },
    {
      icon: Crown,
      title: 'Chat IA ilimitado',
      description: 'Conversa con la IA sin límites semanales'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-9 w-9 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Suscripción</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Status */}
        <div className="neu-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Estado actual</h2>
            {isPremium && <PremiumBadge />}
          </div>
          
          {subscription && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium capitalize">
                  {subscription.plan_type === 'free' ? 'Gratuito' : 
                   subscription.plan_type === 'monthly' ? 'Premium Mensual' : 'Premium Anual'}
                </span>
              </div>
              
              {subscription.expires_at && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Expira:</span>
                  <span className="font-medium">{formatDate(subscription.expires_at)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estado:</span>
                <span className={`font-medium capitalize ${
                  subscription.status === 'active' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {subscription.status === 'active' ? 'Activo' : subscription.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Usage Stats for Free Users */}
        {!isPremium && usage && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Uso actual</h3>
            <UsageLimitsBanner type="routines" />
            <UsageLimitsBanner type="nutrition" />
            <UsageLimitsBanner type="ai_chat" />
          </div>
        )}

        {/* Premium Benefits */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Beneficios Premium
          </h3>
          
          <div className="space-y-3">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="neu-card p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  {isPremium && (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 ml-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Plans */}
        {!isPremium && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Planes disponibles</h3>
            
            <div className="space-y-3">
              {yearlyPlan && (
                <div className="neu-card p-6 border-2 border-yellow-500/30 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MEJOR VALOR - 61% DESCUENTO
                    </span>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold">{yearlyPlan.name}</h4>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-3xl font-bold">${yearlyPlan.price_usd}</span>
                      <span className="text-muted-foreground">/año</span>
                    </div>
                    <p className="text-green-500 font-medium mt-1">Equivale a $2.50/mes</p>
                  </div>
                  
                  <Button
                    onClick={() => handleUpgrade('yearly')}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                    size="lg"
                  >
                    Obtener Premium Anual
                  </Button>
                </div>
              )}

              {monthlyPlan && (
                <div className="neu-card p-6">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold">{monthlyPlan.name}</h4>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-2xl font-bold">${monthlyPlan.price_usd}</span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="secondary"
                    onClick={() => handleUpgrade('monthly')}
                    className="w-full"
                    size="lg"
                  >
                    Obtener Premium Mensual
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel Subscription */}
        {isPremium && subscription?.status === 'active' && (
          <div className="neu-card p-6">
            <h3 className="text-lg font-semibold mb-3">Gestionar suscripción</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Si cancelas tu suscripción, seguirás teniendo acceso a las funciones premium hasta que expire.
            </p>
            <Button
              variant="secondary"
              onClick={cancelSubscription}
              className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
            >
              Cancelar suscripción
            </Button>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Los pagos se procesan de forma segura a través de la tienda de aplicaciones.</p>
          <p>Cancela en cualquier momento desde la configuración de tu cuenta.</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
