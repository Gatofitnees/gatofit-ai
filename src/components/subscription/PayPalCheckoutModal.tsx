import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, CreditCard, Loader2, Tag } from 'lucide-react';
import { useDiscountCode } from '@/hooks/subscription/useDiscountCode';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'monthly' | 'yearly';
  planName: string;
  originalPrice: number;
  onSuccess: () => void;
}

type CheckoutStep = 'discount' | 'confirm';

export const PayPalCheckoutModal = ({ 
  isOpen, 
  onClose, 
  planType, 
  planName, 
  originalPrice,
  onSuccess 
}: PayPalCheckoutModalProps) => {
  const [step, setStep] = useState<CheckoutStep>('discount');
  const [discountCode, setDiscountCode] = useState('');
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const { toast } = useToast();
  const { 
    applyDiscountCode, 
    validateDiscountCode,
    appliedDiscount, 
    isApplying,
    clearDiscount 
  } = useDiscountCode();

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de descuento",
        variant: "destructive"
      });
      return;
    }

    const result = await validateDiscountCode(discountCode, planType);
    if (result.success) {
      setStep('confirm');
    }
  };

  const handleContinueWithoutDiscount = () => {
    clearDiscount();
    setStep('confirm');
  };

  const calculateFinalPrice = () => {
    if (!appliedDiscount) return originalPrice;

    if (appliedDiscount.paypal_discount_fixed) {
      return Math.max(0, originalPrice - appliedDiscount.paypal_discount_fixed);
    }

    if (appliedDiscount.paypal_discount_percentage) {
      return originalPrice * (1 - appliedDiscount.paypal_discount_percentage / 100);
    }

    return originalPrice;
  };

  const handleSubscribe = async () => {
    try {
      setIsCreatingSubscription(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Crear suscripción en PayPal con descuento si aplica
    const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
      body: {
        planType,
        userId: user.id,
        discountCode: appliedDiscount ? discountCode : undefined,
        returnUrl: window.location.origin
      }
    });

      if (error) throw error;

      if (data?.approvalUrl) {
        // Abrir ventana de PayPal
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No se recibió URL de aprobación de PayPal');
      }
    } catch (error) {
      console.error('Error creating PayPal subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de pago. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  const handleClose = () => {
    setStep('discount');
    setDiscountCode('');
    clearDiscount();
    onClose();
  };

  const finalPrice = calculateFinalPrice();
  const discountAmount = originalPrice - finalPrice;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Suscripción con PayPal
          </DialogTitle>
        </DialogHeader>

        {step === 'discount' && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                ¿Tienes un código de descuento?
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-code">Código de descuento</Label>
                <div className="flex gap-2">
                  <Input
                    id="discount-code"
                    placeholder="Ingresa tu código"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    disabled={isApplying}
                  />
                  <Button 
                    onClick={handleApplyDiscount}
                    disabled={isApplying || !discountCode.trim()}
                  >
                    {isApplying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Aplicar'
                    )}
                  </Button>
                </div>
              </div>

              {appliedDiscount && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">
                    ¡Código aplicado correctamente!
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleContinueWithoutDiscount}
                variant="outline"
                className="w-full"
              >
                Continuar sin código
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="p-4 bg-card border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-medium">{planName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Precio original</span>
                  <span className="font-medium">${originalPrice.toFixed(2)} USD</span>
                </div>

                {appliedDiscount && discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-400">
                    <span className="text-sm flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Descuento
                    </span>
                    <span className="font-medium">-${discountAmount.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ${finalPrice.toFixed(2)} USD
                  </span>
                </div>

                {appliedDiscount?.application_type === 'forever' && (
                  <div className="text-xs text-muted-foreground">
                    * Descuento aplicado a todas las facturas futuras
                  </div>
                )}
                {appliedDiscount?.application_type === 'first_billing_only' && (
                  <div className="text-xs text-muted-foreground">
                    * Descuento aplicado solo a la primera factura
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleSubscribe}
                  disabled={isCreatingSubscription}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingSubscription ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="currentColor">
                        <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 01-.794.679H7.72a.483.483 0 01-.477-.558L7.418 21l.7-4.432.026-.17a.806.806 0 01.793-.679h.513c2.334 0 4.16-.945 4.693-3.678.224-1.143.108-2.097-.427-2.767-.163-.206-.361-.38-.593-.522z"/>
                      </svg>
                      Suscribirme ahora
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => setStep('discount')}
                  variant="ghost"
                  className="w-full"
                  disabled={isCreatingSubscription}
                >
                  Volver
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
