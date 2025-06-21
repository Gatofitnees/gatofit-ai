
import { useState, useCallback } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useFoodCaptureWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { isPremium } = useSubscription();
  const { incrementUsage, checkNutritionLimit, showLimitReachedToast } = useUsageLimits();

  const capturePhotoWithLimitCheck = useCallback(async () => {
    console.log('📸 [FOOD CAPTURE WITH LIMITS] Attempting to capture photo');
    
    const limitCheck = await checkNutritionLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      console.log('🚫 [FOOD CAPTURE WITH LIMITS] Limit reached, showing premium modal');
      showLimitReachedToast('nutrition_photos');
      setShowPremiumModal(true);
      return false;
    }

    try {
      // Incrementar uso inmediatamente si no es premium
      if (!isPremium) {
        console.log('📈 [FOOD CAPTURE WITH LIMITS] Incrementing nutrition usage');
        await incrementUsage('nutrition_photos');
      }
      
      console.log('✅ [FOOD CAPTURE WITH LIMITS] Photo capture allowed');
      return true;
    } catch (error) {
      console.error('❌ [FOOD CAPTURE WITH LIMITS] Error in photo capture:', error);
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
