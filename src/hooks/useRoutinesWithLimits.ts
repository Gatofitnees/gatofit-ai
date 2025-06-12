
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
        // Increment usage counter for free users
        await incrementUsage('routines');
      }

      // Refetch routines to update the list
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
    getRoutineUsageInfo,
    showPremiumModal,
    setShowPremiumModal,
    isPremium
  };
};
