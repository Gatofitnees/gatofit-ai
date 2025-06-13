
import React from 'react';
import { ArrowRight, RefreshCw, Clock } from 'lucide-react';
import Button from '@/components/Button';
import { UserSubscription } from '@/hooks/useSubscription';

interface SubscriptionManagerProps {
  subscription: UserSubscription | null;
  onReactivate: () => void;
  onChangePlan: () => void;
  isLoading?: boolean;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  subscription,
  onReactivate,
  onChangePlan,
  isLoading = false
}) => {
  const isExpiredOrCancelled = subscription && 
    (subscription.status === 'expired' || subscription.status === 'cancelled');
  
  const isActive = subscription && subscription.status === 'active';

  if (!subscription) return null;

  return (
    <div className="space-y-4">
      {/* Reactivate Subscription */}
      {isExpiredOrCancelled && (
        <div className="neu-card p-5 border-2 border-primary/30">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-base">¿Tienes una suscripción anterior?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Detectamos que tenías una suscripción {subscription.plan_type === 'monthly' ? 'mensual' : 'anual'} activa. 
                  Puedes retomarla fácilmente.
                </p>
              </div>
              <Button
                onClick={onReactivate}
                disabled={isLoading}
                variant="primary"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {isLoading ? 'Reactivando...' : 'Retomar mi suscripción'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan */}
      {isActive && (
        <div className="neu-card p-5 border border-secondary/30">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-base">Cambiar de plan</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Actualmente tienes el plan {subscription.plan_type === 'monthly' ? 'mensual' : 'anual'}. 
                  {subscription.plan_type === 'monthly' ? 
                    ' Ahorra hasta 61% cambiando al plan anual.' : 
                    ' Cambia a mensual para más flexibilidad.'
                  }
                </p>
              </div>
              <Button
                onClick={onChangePlan}
                disabled={isLoading}
                variant="secondary"
                className="w-full sm:w-auto"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {isLoading ? 'Cambiando...' : 'Cambiar a otro plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
