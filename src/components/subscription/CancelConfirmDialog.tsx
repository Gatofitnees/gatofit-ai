
import React from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
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

interface CancelConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isPaymentFailed?: boolean;
}

export const CancelConfirmDialog: React.FC<CancelConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  isPaymentFailed = false
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Heart className="h-6 w-6 text-red-500" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold">
            Lamentamos que tengas que irte
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground space-y-3">
            {isPaymentFailed ? (
              <>
                <p className="text-destructive font-semibold">
                  ⚠️ Estás a punto de cancelar tu suscripción permanentemente y volver al plan Free.
                </p>
                <p>
                  <strong>Perderás acceso inmediato</strong> a todas las funciones premium.
                </p>
                <p className="text-xs">
                  💡 <strong>Sugerencia:</strong> Si solo quieres actualizar tu método de pago, usa el botón "Actualizar método de pago" en la página de suscripción en su lugar.
                </p>
              </>
            ) : (
              <>
                <p>
                  Esperamos que puedas seguir con tu progreso y en un futuro volver con nosotros.
                </p>
                <p>
                  Recuerda que seguirás teniendo acceso a todas las funciones premium hasta que expire tu suscripción actual.
                </p>
                <p className="text-primary font-medium">
                  ¡Tu progreso estará aquí esperándote cuando regreses! 💪
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogCancel
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            No quiero cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-secondary hover:bg-secondary/80"
          >
            {isLoading ? 'Cancelando...' : 'Continuar mi cancelación'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
