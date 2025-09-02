import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscountCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (discount: { type: string; value: number }) => void;
  isLoading?: boolean;
}

export const DiscountCodeModal: React.FC<DiscountCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isLoading = false
}) => {
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();

  const handleApplyCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de descuento",
        variant: "destructive"
      });
      return;
    }

    try {
      setApplying(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase.rpc('apply_discount_code', {
        p_user_id: user.id,
        p_code: code.trim().toLowerCase()
      });

      if (error) {
        throw error;
      }

      const result = data as any;

      if (!result?.success) {
        toast({
          title: "Código inválido",
          description: result?.error || "El código ingresado no es válido",
          variant: "destructive"
        });
        return;
      }

      // Success
      toast({
        title: "¡Código aplicado!",
        description: result.discount?.type === 'months_free' 
          ? `Se han agregado ${result.discount.value} meses gratis a tu suscripción`
          : "Descuento aplicado correctamente",
        variant: "default"
      });

      onSuccess(result.discount);
      setCode('');
      onClose();

    } catch (error) {
      console.error('Error applying discount code:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al aplicar el código. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };

  const handleClose = () => {
    if (!applying) {
      setCode('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Código de descuento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="discount-code">
              Ingresa tu código de descuento
            </Label>
            <Input
              id="discount-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: ebooksecret"
              disabled={applying || isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !applying && !isLoading) {
                  handleApplyCode();
                }
              }}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={applying || isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApplyCode}
              disabled={applying || isLoading || !code.trim()}
              className="flex-1"
            >
              {applying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Aplicar código
            </Button>
          </div>
        </div>

        {/* Hint for demo */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <strong>Código de prueba:</strong> "ebooksecret" - 6 meses gratis de premium
        </div>
      </DialogContent>
    </Dialog>
  );
};