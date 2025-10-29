import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentFailureAlertProps {
  gracePeriodEndsAt: string;
  onDismiss?: () => void;
  compact?: boolean;
}

export const PaymentFailureAlert: React.FC<PaymentFailureAlertProps> = ({
  gracePeriodEndsAt,
  onDismiss,
  compact = false,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [gracePeriodEndsAt]);

  const handleUpdatePayment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('retry-paypal-payment');

      if (error) throw error;

      if (data?.success && !data?.redirectUrl) {
        // Payment already processed
        toast({
          title: "¡Pago procesado!",
          description: data.message || "Tu suscripción está activa nuevamente",
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        // Payment still pending
        toast({
          title: "Información",
          description: "Puedes reintentar el pago cuantas veces necesites. También puedes crear una nueva suscripción seleccionando un plan abajo.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "No pudimos procesar la solicitud. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const urgencyLevel = daysRemaining <= 1 ? 'critical' : daysRemaining <= 2 ? 'warning' : 'info';

  if (compact) {
    return (
      <div className={`
        neu-card p-4 border
        ${urgencyLevel === 'critical' ? 'bg-destructive/10 border-destructive/30' : 
          urgencyLevel === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : 
          'bg-blue-500/10 border-blue-500/30'}
      `}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
              urgencyLevel === 'critical' ? 'text-destructive' : 
              urgencyLevel === 'warning' ? 'text-yellow-500' : 
              'text-blue-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Problema con el pago</p>
              <p className="text-xs text-muted-foreground">
                {daysRemaining}d {hoursRemaining}h restantes
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUpdatePayment}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <CreditCard className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      neu-card p-6 border
      ${urgencyLevel === 'critical' ? 'bg-destructive/10 border-destructive/30' : 
        urgencyLevel === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : 
        'bg-blue-500/10 border-blue-500/30'}
    `}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${
          urgencyLevel === 'critical' ? 'bg-destructive/20' : 
          urgencyLevel === 'warning' ? 'bg-yellow-500/20' : 
          'bg-blue-500/20'
        }`}>
          <AlertCircle className={`h-6 w-6 ${
            urgencyLevel === 'critical' ? 'text-destructive' : 
            urgencyLevel === 'warning' ? 'text-yellow-500' : 
            'text-blue-500'
          }`} />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-base mb-1">
              {urgencyLevel === 'critical' ? '⚠️ Acción requerida urgente' : 'Problema con tu pago'}
            </h3>
            <p className="text-sm text-muted-foreground">
              No pudimos procesar tu pago. Por favor actualiza tu método de pago para mantener el acceso premium.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className="font-medium">
              {daysRemaining > 0 ? (
                <>Tiempo restante: <span className={urgencyLevel === 'critical' ? 'text-destructive' : ''}>{daysRemaining} días {hoursRemaining} horas</span></>
              ) : (
                <span className="text-destructive">Tu período de gracia ha expirado</span>
              )}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleUpdatePayment}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isLoading ? 'Procesando...' : 'Actualizar método de pago'}
            </Button>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
