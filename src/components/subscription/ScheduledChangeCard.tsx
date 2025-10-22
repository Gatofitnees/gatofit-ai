
import React, { useState } from 'react';
import { Clock, Calendar, ArrowRight, XCircle } from 'lucide-react';
import Button from '@/components/Button';
import { UserSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { CancelScheduledChangeDialog } from './CancelScheduledChangeDialog';

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
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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
    <div className="neu-card p-5 border border-primary/20 bg-gradient-to-r from-background to-secondary/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-foreground">Cambio de Plan Programado</h3>
          <p className="text-sm text-primary">Se ejecutará automáticamente</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between neu-card p-3 bg-secondary/20 border border-secondary/20">
          <div className="text-center flex-1">
            <p className="text-sm font-medium text-foreground">{currentPlan?.name}</p>
            <p className="text-xs text-muted-foreground">Plan Actual</p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary mx-3" />
          <div className="text-center flex-1">
            <p className="text-sm font-medium text-foreground">{nextPlan?.name}</p>
            <p className="text-xs text-muted-foreground">Nuevo Plan</p>
          </div>
        </div>

        <div className="flex items-center gap-3 neu-card p-3 bg-secondary/20 border border-secondary/20">
          <Calendar className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Fecha del cambio</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(subscription.next_plan_starts_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{daysUntilChange}</p>
            <p className="text-xs text-muted-foreground">días restantes</p>
          </div>
        </div>

        <div className="neu-card p-3 bg-primary/10 border border-primary/20">
          <p className="text-xs text-primary text-center">
            <strong>💳 Trial de $0 activo:</strong> Tu suscripción PayPal está creada pero sin cobro hasta {formatDate(subscription.next_plan_starts_at || '')}
          </p>
        </div>

        <div className="neu-card p-3 bg-accent/10 border border-accent/20">
          <p className="text-xs text-accent-foreground text-center">
            <strong>✅ Cancelación sin costo:</strong> Puedes cancelar el cambio programado sin ningún cargo, 
            ya que aún no se ha realizado el cobro.
          </p>
        </div>

        <Button
          variant="outline"
          fullWidth
          onClick={() => setShowCancelDialog(true)}
          disabled={isLoading}
          className="border-destructive/20 text-destructive hover:bg-destructive/10"
          leftIcon={<XCircle className="h-4 w-4" />}
        >
          Cancelar cambio programado
        </Button>
      </div>

      <CancelScheduledChangeDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => {
          setShowCancelDialog(false);
          onCancelScheduledChange();
        }}
        isLoading={isLoading}
      />
    </div>
  );
};
