import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscountInfo {
  type: string;
  value: number;
  application_type?: string;
  paypal_discount_percentage?: number;
  paypal_discount_fixed?: number;
  applicable_plans?: string[];
}

export const useDiscountCode = () => {
  const [isApplying, setIsApplying] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null);
  const { toast } = useToast();

  const validateDiscountCode = async (code: string, planType: 'monthly' | 'yearly'): Promise<{ success: boolean; discount?: DiscountInfo }> => {
    try {
      setIsApplying(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Call secure RPC function for validation
      const { data, error } = await supabase.rpc('validate_discount_code', {
        p_code: code.trim(),
        p_user_id: user.id,
        p_plan_type: planType
      });

      if (error) {
        console.error('RPC error validating discount code:', error);
        toast({
          title: "Error",
          description: "Hubo un problema al validar el código. Inténtalo de nuevo.",
          variant: "destructive"
        });
        return { success: false };
      }

      const result = data as unknown as { success: boolean; discount?: DiscountInfo; error?: string };

      if (!result.success) {
        toast({
          title: "Código inválido",
          description: result.error || "El código ingresado no es válido",
          variant: "destructive"
        });
        return { success: false };
      }

      setAppliedDiscount(result.discount!);

      toast({
        title: "¡Código válido!",
        description: "El código de descuento se aplicará a tu suscripción",
        variant: "default"
      });

      return { success: true, discount: result.discount };

    } catch (error) {
      console.error('Error validating discount code:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al validar el código. Inténtalo de nuevo.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsApplying(false);
    }
  };

  const applyDiscountCode = async (code: string): Promise<{ success: boolean; discount?: DiscountInfo }> => {
    try {
      setIsApplying(true);
      
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
        return { success: false };
      }

      const discountInfo = result.discount as DiscountInfo;
      setAppliedDiscount(discountInfo);

      toast({
        title: "¡Código aplicado!",
        description: discountInfo.type === 'months_free' 
          ? `Se han agregado ${discountInfo.value} meses gratis a tu suscripción`
          : "Descuento aplicado correctamente",
        variant: "default"
      });

      return { success: true, discount: discountInfo };

    } catch (error) {
      console.error('Error applying discount code:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al aplicar el código. Inténtalo de nuevo.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsApplying(false);
    }
  };

  const clearDiscount = () => {
    setAppliedDiscount(null);
  };

  return {
    applyDiscountCode,
    validateDiscountCode,
    clearDiscount,
    isApplying,
    appliedDiscount
  };
};