
import { useState, useCallback } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useFoodCaptureWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { isPremium } = useSubscription();
  const { checkNutritionLimit, showLimitReachedToast } = useUsageLimits();

  const capturePhotoWithLimitCheck = useCallback(async () => {
    console.log('📸 [FOOD CAPTURE WITH LIMITS] Attempting to capture photo');
    
    const limitCheck = await checkNutritionLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      console.log('🚫 [FOOD CAPTURE WITH LIMITS] Limit reached, showing premium modal');
      showLimitReachedToast('nutrition_photos');
      setShowPremiumModal(true);
      return false;
    }

    console.log('✅ [FOOD CAPTURE WITH LIMITS] Photo capture allowed');
    return true;
  }, [checkNutritionLimit, isPremium, showLimitReachedToast]);

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
