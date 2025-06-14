
import React from 'react';
import { Clock, Calendar, DollarSign } from 'lucide-react';
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
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold">
            Cambio de Plan Programado
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground space-y-4">
            <div className="neu-card p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">¡No perderás dinero!</span>
              </div>
              <p className="text-sm text-green-700">
                Tu tiempo pagado actual se respetará completamente.
              </p>
            </div>
            
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Plan actual: {currentPlan?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Termina el {expirationDate ? formatDate(expirationDate) : 'fecha no disponible'}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {daysRemaining} días restantes que conservarás
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Nuevo plan: {newPlan?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Comenzará automáticamente el {expirationDate ? formatDate(expirationDate) : 'cuando expire tu plan actual'}
                  </p>
                  <p className="text-xs text-purple-600 font-medium">
                    ${newPlan?.price_usd} por {newPlan?.plan_type === 'monthly' ? 'mes' : 'año'}
                  </p>
                </div>
              </div>
            </div>

            <div className="neu-card p-3 bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-800 text-center">
                <strong>Resumen:</strong> Disfrutarás tu plan actual hasta su vencimiento, 
                luego cambiarás automáticamente al {newPlan?.name}.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isLoading ? 'Programando cambio...' : 'Confirmar cambio programado'}
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
