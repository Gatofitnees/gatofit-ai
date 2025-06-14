
import React from 'react';
import { Clock, Calendar, X, ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import { UserSubscription, SubscriptionPlan } from '@/hooks/useSubscription';

interface ScheduledChangeCardProps {
  subscription: UserSubscription;
  plans: SubscriptionPlan[];
  onCancelScheduledChange: () => void;
  isLoading?: boolean;
}

export const ScheduledChangeCard: React.FC<ScheduledChangeCardProps> = ({
  subscription,
  plans,
  onCancelScheduledChange,
  isLoading = false
}) => {
  if (!subscription.next_plan_type || !subscription.next_plan_starts_at) {
    return null;
  }

  const currentPlan = plans.find(p => p.plan_type === subscription.plan_type);
  const nextPlan = plans.find(p => p.plan_type === subscription.next_plan_type);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysUntilChange = (changeDate: string) => {
    const now = new Date();
    const change = new Date(changeDate);
    const diffTime = change.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysUntilChange = calculateDaysUntilChange(subscription.next_plan_starts_at);

  return (
    <div className="neu-card p-5 border-2 border-blue-500/30 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-gray-900">Cambio de Plan Programado</h3>
            <p className="text-sm text-blue-600">Se ejecutará automáticamente</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancelScheduledChange}
          disabled={isLoading}
          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between neu-card p-3 bg-white/50">
          <div className="text-center flex-1">
            <p className="text-sm font-medium text-gray-900">{currentPlan?.name}</p>
            <p className="text-xs text-gray-600">Plan Actual</p>
          </div>
          <ArrowRight className="h-4 w-4 text-blue-500 mx-3" />
          <div className="text-center flex-1">
            <p className="text-sm font-medium text-gray-900">{nextPlan?.name}</p>
            <p className="text-xs text-gray-600">Nuevo Plan</p>
          </div>
        </div>

        <div className="flex items-center gap-3 neu-card p-3 bg-white/50">
          <Calendar className="h-4 w-4 text-purple-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Fecha del cambio</p>
            <p className="text-xs text-gray-600">
              {formatDate(subscription.next_plan_starts_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-purple-600">{daysUntilChange}</p>
            <p className="text-xs text-gray-600">días restantes</p>
          </div>
        </div>

        <div className="neu-card p-3 bg-green-50 border border-green-200">
          <p className="text-xs text-green-800 text-center">
            <strong>¡Tiempo respetado!</strong> No perderás ningún día de tu plan actual. 
            El cambio se aplicará exactamente cuando expire.
          </p>
        </div>
      </div>
    </div>
  );
};
