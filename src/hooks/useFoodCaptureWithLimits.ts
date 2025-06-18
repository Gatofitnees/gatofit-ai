
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useFoodCaptureWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { isPremium } = useSubscription();
  const { checkNutritionLimit, showLimitReachedToast } = useUsageLimits();

  const capturePhotoWithLimitCheck = async () => {
    console.log('🔍 [FOOD CAPTURE] Verificando límites antes de captura');
    
    const limitCheck = checkNutritionLimit(isPremium);
    console.log('🔍 [FOOD CAPTURE] Resultado verificación:', limitCheck);
    
    if (!limitCheck.canProceed) {
      console.log('❌ [FOOD CAPTURE] Límite alcanzado, mostrando modal premium');
      showLimitReachedToast('nutrition_photos');
      setShowPremiumModal(true);
      return false;
    }

    console.log('✅ [FOOD CAPTURE] Puede proceder con captura');
    // NO incrementar aquí - se hará después del procesamiento exitoso
    return true;
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
