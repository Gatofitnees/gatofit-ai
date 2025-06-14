
import React from 'react';
import { Clock } from 'lucide-react';
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
      day: 'numeric'
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold">
            Cambio de Plan Programado
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground space-y-2">
            <p>
              Tu plan actual <strong>{currentPlan?.name}</strong> se mantendrá activo hasta{' '}
              <strong>{expirationDate ? formatDate(expirationDate) : 'su fecha de expiración'}</strong>.
            </p>
            <p>
              Después de esa fecha, cambiarás automáticamente al{' '}
              <strong>{newPlan?.name}</strong> por <strong>${newPlan?.price_usd}</strong>.
            </p>
            <p className="text-primary font-medium">
              ¡No perderás ningún beneficio de tu plan actual! 💪
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Programando cambio...' : 'Confirmar cambio de plan'}
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
