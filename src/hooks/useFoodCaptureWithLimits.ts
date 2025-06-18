
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useFoodCaptureWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { isPremium } = useSubscription();
  const { incrementUsage, checkNutritionLimit, showLimitReachedToast } = useUsageLimits();

  const capturePhotoWithLimitCheck = async () => {
    const limitCheck = checkNutritionLimit(isPremium);
    
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
  };

  const getNutritionUsageInfo = () => {
    const limitCheck = checkNutritionLimit(isPremium);
    return {
      current: limitCheck.currentUsage,
      limit: limitCheck.limit,
      canCapture: limitCheck.canProceed,
      isOverLimit: limitCheck.isOverLimit
    };
  };

  return {
    capturePhotoWithLimitCheck,
    getNutritionUsageInfo,
    showPremiumModal,
    setShowPremiumModal,
    isPremium
  };
};
