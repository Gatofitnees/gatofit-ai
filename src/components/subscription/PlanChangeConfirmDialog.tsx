
import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SubscriptionPlan } from '@/hooks/useSubscription';

interface PlanChangeConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: SubscriptionPlan | null;
  newPlan: SubscriptionPlan | null;
  expirationDate: string | null;
  isLoading: boolean;
}

export const PlanChangeConfirmDialog: React.FC<PlanChangeConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  expirationDate,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = expirationDate ? calculateDaysRemaining(expirationDate) : 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold">
            Confirmar Cambio de Plan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground space-y-4">
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Plan actual: {currentPlan?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Termina el {expirationDate ? formatDate(expirationDate) : 'fecha no disponible'}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {daysRemaining} días restantes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-secondary-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Nuevo plan: {newPlan?.name}</p>
                  <p className="text-xs text-secondary-foreground font-medium">
                    ${newPlan?.price_usd} por {newPlan?.plan_type === 'monthly' ? 'mes' : 'año'}
                  </p>
                </div>
              </div>
            </div>

            <div className="neu-card p-3 bg-secondary/30 border border-secondary/20">
              <p className="text-xs text-foreground text-left">
                <strong>🚀 Cambio inmediato:</strong> Tu plan se actualizará de {currentPlan?.name} a {newPlan?.name} al confirmar el pago en PayPal.
                <br/><br/>
                <strong>💳 Nuevo cobro:</strong> Se te cobrará ${newPlan?.price_usd} y tu suscripción PayPal actual será cancelada.
                <br/><br/>
                📅 Tu nueva suscripción durará {newPlan?.duration_days} días desde hoy.
                <br/><br/>
                ⚠️ <strong>Importante:</strong> Los {daysRemaining} días restantes de tu plan actual no se transferirán. El nuevo plan comenzará inmediatamente después del pago.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Procesando...' : 'Confirmar cambio de plan'}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onClose}
            className="w-full"
          >
            Mantener mi plan actual
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
