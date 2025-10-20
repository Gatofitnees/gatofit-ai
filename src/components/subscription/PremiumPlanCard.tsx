
import React, { useState } from 'react';
import { Check, Star, Zap, Crown, CheckCircle, CreditCard } from 'lucide-react';
import Button from '@/components/Button';
import { SubscriptionPlan } from '@/hooks/subscription/types';
import { PayPalCheckoutModal } from './PayPalCheckoutModal';

interface PremiumPlanCardProps {
  plan: SubscriptionPlan;
  isRecommended?: boolean;
  onSelect: (planType: 'monthly' | 'yearly') => void;
  isLoading?: boolean;
  discountText?: string;
  isCurrentPlan?: boolean;
  onPayPalSuccess?: () => void;
}

export const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({
  plan,
  isRecommended = false,
  onSelect,
  isLoading = false,
  discountText,
  isCurrentPlan = false,
  onPayPalSuccess
}) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const monthlyEquivalent = plan.plan_type === 'yearly' ? (plan.price_usd / 12).toFixed(2) : null;

  const handleOpenCheckout = () => {
    if (!isCurrentPlan && !isLoading) {
      setShowCheckoutModal(true);
    }
  };

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
    if (onPayPalSuccess) {
      onPayPalSuccess();
    }
  };

  const getButtonContent = () => {
    if (isCurrentPlan) {
      return (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Tu plan actual
        </div>
      );
    }
    
    if (isLoading) {
      return 'Procesando...';
    }
    
    return (
      <div className="flex items-center justify-center gap-2">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 01-.794.679H7.72a.483.483 0 01-.477-.558L7.418 21l.7-4.432.026-.17a.806.806 0 01.793-.679h.513c2.334 0 4.16-.945 4.693-3.678.224-1.143.108-2.097-.427-2.767-.163-.206-.361-.38-.593-.522z"/>
          <path d="M6.59 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 01-.794.679H-5.72a.483.483 0 01-.477-.558L-5.582 21l.7-4.432.026-.17a.806.806 0 01.793-.679h.513c2.334 0 4.16-.945 4.693-3.678.224-1.143.108-2.097-.427-2.767-.163-.206-.361-.38-.593-.522z"/>
          <path d="M19.22 3.113c-.563-.315-1.222-.51-1.985-.51H8.832C8.328 2.603 7.9 3 7.837 3.51L5.653 17.24a.61.61 0 00.602.704h4.375l1.099-6.968-.034.22a.805.805 0 01.793-.679h1.65c3.239 0 5.775-1.314 6.514-5.12.028-.148.055-.292.074-.433.278-1.779-.002-2.992-.93-4.114a3.694 3.694 0 00-.576-.492z"/>
        </svg>
        Pagar con PayPal
      </div>
    );
  };

  const getButtonStyles = () => {
    if (isCurrentPlan) {
      return 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default';
    }
    
    if (isRecommended) {
      return 'bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-glow';
    }
    
    return 'bg-secondary hover:bg-secondary/80';
  };

  return (
    <div className={`relative neu-card ${isRecommended ? 'pt-12 pb-6 px-6 ring-2 ring-primary/50 shadow-glow' : 'p-6'} ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-primary to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            ¡Oferta Especial: Ahorra 61%!
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Activo
          </div>
        </div>
      )}

      {/* Discount Text */}
      {discountText && !isRecommended && !isCurrentPlan && (
        <div className="absolute -top-2 right-4">
          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {discountText}
          </span>
        </div>
      )}

      <div className="text-center space-y-4">
        {/* Plan Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h3 className="text-xl font-bold">{plan.name}</h3>
          </div>
          
          {/* Price Display */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-primary">${plan.price_usd}</span>
              <span className="text-muted-foreground">
                /{plan.plan_type === 'yearly' ? 'año' : 'mes'}
              </span>
            </div>
            {monthlyEquivalent && (
              <p className="text-green-500 font-medium text-sm">
                Equivale a ${monthlyEquivalent}/mes
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium">Rutinas ilimitadas</p>
              <p className="text-xs text-muted-foreground">Sin restricciones de creación</p>
            </div>
            <Check className="h-4 w-4 text-green-500 ml-auto" />
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium">Análisis nutricional IA</p>
              <p className="text-xs text-muted-foreground">Escaneos ilimitados semanales</p>
            </div>
            <Check className="h-4 w-4 text-green-500 ml-auto" />
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <Star className="h-4 w-4 text-white fill-current" />
            </div>
            <div className="text-left">
              <p className="font-medium">Chat IA ilimitado</p>
              <p className="text-xs text-muted-foreground">Asesoría personalizada 24/7</p>
            </div>
            <Check className="h-4 w-4 text-green-500 ml-auto" />
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          {isCurrentPlan ? (
            <Button
              disabled
              className="w-full py-3 text-base font-semibold bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
              size="lg"
            >
              Plan Actual
            </Button>
          ) : (
            <Button
              onClick={handleOpenCheckout}
              disabled={isLoading}
              className={`w-full py-3 text-base font-semibold ${getButtonStyles()}`}
              size="lg"
            >
              {isLoading ? (
                'Procesando...'
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Suscribirme con PayPal
                </div>
              )}
            </Button>
          )}
        </div>

        <PayPalCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          planType={plan.plan_type as 'monthly' | 'yearly'}
          planName={plan.name}
          originalPrice={plan.price_usd}
          onSuccess={handleCheckoutSuccess}
        />
      </div>
    </div>
  );
};
