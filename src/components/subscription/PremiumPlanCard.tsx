
import React from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import Button from '@/components/Button';
import { SubscriptionPlan } from '@/hooks/useSubscription';

interface PremiumPlanCardProps {
  plan: SubscriptionPlan;
  isRecommended?: boolean;
  onSelect: (planType: 'monthly' | 'yearly') => void;
  isLoading?: boolean;
  discountText?: string;
}

export const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({
  plan,
  isRecommended = false,
  onSelect,
  isLoading = false,
  discountText
}) => {
  const monthlyEquivalent = plan.plan_type === 'yearly' ? (plan.price_usd / 12).toFixed(2) : null;

  return (
    <div className={`relative neu-card p-6 ${isRecommended ? 'ring-2 ring-primary/50 shadow-glow' : ''}`}>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-primary to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            ¡Oferta Especial: Ahorra 61%!
          </div>
        </div>
      )}

      {/* Discount Text */}
      {discountText && !isRecommended && (
        <div className="absolute -top-2 right-4">
          <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
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
        <Button
          onClick={() => onSelect(plan.plan_type)}
          disabled={isLoading}
          className={`w-full py-3 text-base font-semibold ${
            isRecommended 
              ? 'bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-glow' 
              : 'bg-secondary hover:bg-secondary/80'
          }`}
          size="lg"
        >
          {isLoading ? 'Procesando...' : `Obtener ${plan.name}`}
        </Button>
      </div>
    </div>
  );
};
