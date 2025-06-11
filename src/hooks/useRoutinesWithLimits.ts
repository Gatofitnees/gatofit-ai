
import { useState } from 'react';
import { useRoutines } from '@/hooks/useRoutines';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useToast } from '@/components/ui/use-toast';

export const useRoutinesWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const routinesHook = useRoutines();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkRoutineLimit, showLimitReachedToast } = useUsageLimits();
  const { toast } = useToast();

  const createRoutineWithLimitCheck = async (routineData: any) => {
    const limitCheck = checkRoutineLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      showLimitReachedToast('routines');
      setShowPremiumModal(true);
      return null;
    }

    try {
      const result = await routinesHook.createRoutine(routineData);
      
      if (result && !isPremium) {
        // Increment usage counter for free users
        await incrementUsage('routines');
      }
      
      return result;
    } catch (error) {
      console.error('Error creating routine:', error);
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
    createRoutine: createRoutineWithLimitCheck,
    getRoutineUsageInfo,
    showPremiumModal,
    setShowPremiumModal,
    isPremium
  };
};
