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

      // Obtener información del código sin aplicarlo
      const { data: discountData, error: discountError } = await supabase
        .from('discount_codes')
        .select('*')
        .ilike('code', code.trim())
        .eq('is_active', true)
        .single();

      if (discountError || !discountData) {
        toast({
          title: "Código inválido",
          description: "El código ingresado no existe o ha expirado",
          variant: "destructive"
        });
        return { success: false };
      }

      // Verificar si aplica al plan seleccionado
      if (discountData.applicable_plans && 
          !discountData.applicable_plans.includes(planType) && 
          !discountData.applicable_plans.includes('both')) {
        toast({
          title: "Código no válido",
          description: `Este código no es válido para el plan ${planType === 'monthly' ? 'mensual' : 'anual'}`,
          variant: "destructive"
        });
        return { success: false };
      }

      // Verificar fechas de validez
      if (discountData.valid_from && new Date(discountData.valid_from) > new Date()) {
        toast({
          title: "Código no disponible",
          description: "Este código aún no está disponible",
          variant: "destructive"
        });
        return { success: false };
      }

      if (discountData.valid_to && new Date(discountData.valid_to) < new Date()) {
        toast({
          title: "Código expirado",
          description: "Este código ya no es válido",
          variant: "destructive"
        });
        return { success: false };
      }

      // Verificar límite de usos
      if (discountData.max_uses && discountData.current_uses >= discountData.max_uses) {
        toast({
          title: "Código agotado",
          description: "Este código ha alcanzado su límite de usos",
          variant: "destructive"
        });
        return { success: false };
      }

      // Verificar si el usuario ya usó este código
      const { data: userUsage } = await supabase
        .from('user_discount_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('discount_code_id', discountData.id)
        .single();

      if (userUsage && discountData.usage_type === 'single_use') {
        toast({
          title: "Código ya usado",
          description: "Ya has usado este código anteriormente",
          variant: "destructive"
        });
        return { success: false };
      }

      const discountInfo: DiscountInfo = {
        type: discountData.discount_type,
        value: discountData.discount_value,
        application_type: discountData.application_type,
        paypal_discount_percentage: discountData.paypal_discount_percentage,
        paypal_discount_fixed: discountData.paypal_discount_fixed,
        applicable_plans: discountData.applicable_plans
      };

      setAppliedDiscount(discountInfo);

      toast({
        title: "¡Código válido!",
        description: "El código de descuento se aplicará a tu suscripción",
        variant: "default"
      });

      return { success: true, discount: discountInfo };

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