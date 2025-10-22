
import React from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';
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

interface CancelScheduledChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const CancelScheduledChangeDialog: React.FC<CancelScheduledChangeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold">
            ¿Cancelar cambio de plan programado?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground space-y-3">
            <p>
              Si cancelas el cambio programado:
            </p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>Se cancelará la suscripción de PayPal del nuevo plan</li>
              <li>Mantendrás tu plan actual hasta su vencimiento</li>
              <li>No se realizará ningún cargo adicional</li>
            </ul>
            <p className="text-primary font-medium">
              Podrás cambiar de plan en cualquier momento desde esta página.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogCancel
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mantener cambio programado
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-secondary hover:bg-secondary/80"
          >
            {isLoading ? 'Cancelando...' : 'Sí, cancelar cambio'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
