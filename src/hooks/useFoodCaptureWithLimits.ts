
import { useState, useCallback } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useFoodCaptureWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { isPremium } = useSubscription();
  const { incrementUsage, checkNutritionLimit, showLimitReachedToast } = useUsageLimits();

  const capturePhotoWithLimitCheck = useCallback(async () => {
    const limitCheck = await checkNutritionLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      showLimitReachedToast('nutrition_photos');
      setShowPremiumModal(true);
      return false;
    }

    try {
      if (!isPremium) {
        await incrementUsage('nutrition_photos');
      }
      return true;
    } catch (error) {
      console.error('Error in photo capture:', error);
      return false;
    }
  }, [checkNutritionLimit, isPremium, showLimitReachedToast, incrementUsage]);

  const getNutritionUsageInfo = useCallback(async () => {
    const limitCheck = await checkNutritionLimit(isPremium);
    return {
      current: limitCheck.currentUsage,
      limit: limitCheck.limit,
      canCapture: limitCheck.canProceed,
      isOverLimit: limitCheck.isOverLimit
    };
  }, [checkNutritionLimit, isPremium]);

  return {
    capturePhotoWithLimitCheck,
    getNutritionUsageInfo,
    showPremiumModal,
    setShowPremiumModal,
    isPremium
  };
};
