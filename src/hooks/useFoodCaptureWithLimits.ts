
import { useState } from 'react';
import { useFoodCapture } from '@/hooks/useFoodCapture';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useFoodCaptureWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const foodCaptureHook = useFoodCapture();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkNutritionLimit, showLimitReachedToast } = useUsageLimits();

  const captureFromCameraWithLimitCheck = async () => {
    const limitCheck = checkNutritionLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      showLimitReachedToast('nutrition_photos');
      setShowPremiumModal(true);
      return null;
    }

    try {
      const result = await foodCaptureHook.captureFromCamera();
      
      if (result && !isPremium) {
        // Increment usage counter for free users
        await incrementUsage('nutrition_photos');
      }
      
      return result;
    } catch (error) {
      console.error('Error capturing from camera:', error);
      return null;
    }
  };

  const captureFromGalleryWithLimitCheck = async () => {
    const limitCheck = checkNutritionLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      showLimitReachedToast('nutrition_photos');
      setShowPremiumModal(true);
      return null;
    }

    try {
      const result = await foodCaptureHook.captureFromGallery();
      
      if (result && !isPremium) {
        // Increment usage counter for free users
        await incrementUsage('nutrition_photos');
      }
      
      return result;
    } catch (error) {
      console.error('Error capturing from gallery:', error);
      return null;
    }
  };

  const uploadImageWithAnalysisWithLimitCheck = async (file: Blob) => {
    const limitCheck = checkNutritionLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      showLimitReachedToast('nutrition_photos');
      setShowPremiumModal(true);
      return null;
    }

    try {
      const result = await foodCaptureHook.uploadImageWithAnalysis(file);
      
      if (result && !isPremium) {
        // Increment usage counter for free users
        await incrementUsage('nutrition_photos');
      }
      
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
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
    ...foodCaptureHook,
    captureFromCamera: captureFromCameraWithLimitCheck,
    captureFromGallery: captureFromGalleryWithLimitCheck,
    uploadImageWithAnalysis: uploadImageWithAnalysisWithLimitCheck,
    getNutritionUsageInfo,
    showPremiumModal,
    setShowPremiumModal,
    isPremium
  };
};
