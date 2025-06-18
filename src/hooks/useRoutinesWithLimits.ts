
import { useState } from 'react';
import { useRoutines } from '@/hooks/useRoutines';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useRoutinesWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const routinesHook = useRoutines();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkRoutineLimit, showLimitReachedToast } = useUsageLimits();
  const { toast } = useToast();

  const createRoutine = async (routineData: any) => {
    const limitCheck = checkRoutineLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      showLimitReachedToast('routines');
      setShowPremiumModal(true);
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('routines')
        .insert({
          ...routineData,
          user_id: user.id,
          is_predefined: false
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data && !isPremium) {
        await incrementUsage('routines');
      }

      await routinesHook.refetch();
      
      return data;
    } catch (error) {
      console.error('Error creating routine:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la rutina",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteRoutine = async (routineId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar que la rutina es del usuario y no es predefinida
      const { data: routine, error: fetchError } = await supabase
        .from('routines')
        .select('user_id, is_predefined')
        .eq('id', routineId)
        .single();

      if (fetchError) throw fetchError;
      
      if (routine.user_id !== user.id) {
        throw new Error('No tienes permisos para eliminar esta rutina');
      }

      // Eliminar la rutina
      const { error: deleteError } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId);

      if (deleteError) throw deleteError;

      // Solo decrementar contador si era una rutina creada por el usuario (no predefinida) y el usuario es free
      if (!routine.is_predefined && !isPremium) {
        await decrementUsage('routines');
      }

      await routinesHook.refetch();
      
      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error deleting routine:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la rutina",
        variant: "destructive"
      });
      return false;
    }
  };

  const decrementUsage = async (type: 'routines') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase.rpc('increment_usage_counter', {
        user_id: user.id,
        counter_type: type,
        increment_by: -1
      });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error decrementing usage:', error);
      return false;
    }
  };

  const getRoutineUsageInfo = () => {
    const limitCheck = checkRoutineLimit(isPremium);
    return {
      current: limitCheck.currentUsage,
      limit: limitCheck.limit,
      canCreate: limitCheck.canProceed,
      isOverLimit: limitCheck.isOverLimit
    };
  };

  return {
    ...routinesHook,
    createRoutine,
    deleteRoutine,
    getRoutineUsageInfo,
    showPremiumModal,
    setShowPremiumModal,
    isPremium
  };
};
