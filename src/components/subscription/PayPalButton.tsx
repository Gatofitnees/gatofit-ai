import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  planType: 'monthly' | 'yearly';
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  planType,
  onSuccess,
  disabled = false,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayPalPayment = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para suscribirte",
          variant: "destructive"
        });
        return;
      }

      // Create PayPal subscription
      const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
        body: { 
          planType,
          userId: user.id 
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error al crear la suscripción de PayPal');
      }

      // Open PayPal checkout in a new tab
      const paypalWindow = window.open(
        data.approvalUrl, 
        '_blank',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!paypalWindow) {
        toast({
          title: "Error",
          description: "No se pudo abrir la ventana de PayPal. Verifica que no esté bloqueada por tu navegador.",
          variant: "destructive"
        });
        return;
      }

      // Monitor the PayPal window
      const checkClosed = setInterval(() => {
        if (paypalWindow.closed) {
          clearInterval(checkClosed);
          // Give some time for the user to complete the payment before checking
          setTimeout(async () => {
            try {
              // Verify payment status
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-paypal-payment', {
                body: { 
                  subscriptionId: data.subscriptionId,
                  userId: user.id 
                }
              });

              if (verifyError || !verifyData.success) {
                console.log('Payment verification failed or incomplete');
                return;
              }

              toast({
                title: "¡Suscripción activada!",
                description: "Tu suscripción de PayPal se ha activado correctamente",
                variant: "default"
              });

              onSuccess?.();
            } catch (error) {
              console.error('Error verifying PayPal payment:', error);
            }
          }, 2000);
        }
      }, 1000);

      // Clean up interval after 10 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
      }, 600000);

    } catch (error) {
      console.error('Error creating PayPal subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Error al procesar el pago con PayPal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayPalPayment}
      disabled={disabled || isLoading}
      className={`w-full bg-[#0070ba] hover:bg-[#005ea6] text-white ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Pagar con PayPal
        </>
      )}
    </Button>
  );
};