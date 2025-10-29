import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PaymentFailurePopupProps {
  gracePeriodEndsAt: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentFailurePopup: React.FC<PaymentFailurePopupProps> = ({
  gracePeriodEndsAt,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const endDate = new Date(gracePeriodEndsAt);
      const diffMs = endDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setDaysRemaining(0);
        setHoursRemaining(0);
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setDaysRemaining(days);
      setHoursRemaining(hours);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [gracePeriodEndsAt]);

  const urgencyLevel = daysRemaining <= 1 ? 'critical' : daysRemaining <= 2 ? 'warning' : 'info';

  const handleRetryPayment = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader>
          <div className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${
            urgencyLevel === 'critical' ? 'bg-destructive/20' : 
            urgencyLevel === 'warning' ? 'bg-yellow-500/20' : 
            'bg-blue-500/20'
          }`}>
            <AlertCircle className={`h-10 w-10 ${
              urgencyLevel === 'critical' ? 'text-destructive' : 
              urgencyLevel === 'warning' ? 'text-yellow-500' : 
              'text-blue-500'
            }`} />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-center">
            {urgencyLevel === 'critical' ? '⚠️ Acción requerida urgente' : '⚠️ Problema con tu pago'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            <p className="text-base">
              No pudimos procesar tu último pago. Necesitas actualizar tu método de pago para mantener tu acceso premium.
            </p>
            <div className={`p-4 rounded-lg ${
              urgencyLevel === 'critical' ? 'bg-destructive/10' : 
              urgencyLevel === 'warning' ? 'bg-yellow-500/10' : 
              'bg-blue-500/10'
            }`}>
              <p className="font-semibold text-lg mb-1">
                Tiempo restante:
              </p>
              <p className={`text-2xl font-bold ${
                urgencyLevel === 'critical' ? 'text-destructive' : 
                urgencyLevel === 'warning' ? 'text-yellow-500' : 
                'text-blue-500'
              }`}>
                {daysRemaining > 0 ? `${daysRemaining} días ${hoursRemaining} horas` : 'Expirado'}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu acceso premium se mantendrá hasta {new Date(gracePeriodEndsAt).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            onClick={handleRetryPayment}
            className="w-full"
            size="lg"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Ir a Reintentar Pago
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
