
import React from 'react';
import { Check, Star, Zap, Crown, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';
import { SubscriptionPlan } from '@/hooks/subscription/types';
import { PayPalButton } from './PayPalButton';

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
  const monthlyEquivalent = plan.plan_type === 'yearly' ? (plan.price_usd / 12).toFixed(2) : null;

  const handleSelect = () => {
    // Only call onSelect if the plan type is valid and it's not the current plan
    if (!isCurrentPlan && (plan.plan_type === 'monthly' || plan.plan_type === 'yearly')) {
      onSelect(plan.plan_type);
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
    
    return `Cambiar a ${plan.name}`;
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

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Subscription Button */}
          <Button
            onClick={handleSelect}
            disabled={isLoading || isCurrentPlan}
            className={`w-full py-3 text-base font-semibold ${getButtonStyles()}`}
            size="lg"
          >
            {getButtonContent()}
          </Button>

          {/* PayPal Button */}
          {!isCurrentPlan && (plan.plan_type === 'monthly' || plan.plan_type === 'yearly') && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground text-center">
                o paga con
              </div>
              <PayPalButton
                planType={plan.plan_type}
                onSuccess={onPayPalSuccess}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
