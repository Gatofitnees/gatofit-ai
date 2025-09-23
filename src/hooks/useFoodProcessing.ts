
import { useState } from 'react';
import { useFoodCapture } from './useFoodCapture';
import { useSubscription } from '@/hooks/useSubscription';
import { useOptimizedUsageLimits } from '@/hooks/useOptimizedUsageLimits';
import { useToast } from '@/hooks/use-toast';
import { useWebhookResponse } from './useWebhookResponse';
import { FoodLogEntry } from './useFoodLog';

type AddEntryFn = (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>) => Promise<FoodLogEntry | null>;

export interface ProcessingFood {
    id: string;
    imageSrc: string;
    blob: Blob;
    supabaseUrl?: string;
    error?: string | null;
}

// Helper function to extract image path from Supabase URL
const extractImagePathFromUrl = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'food-images');
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    return null;
  } catch (error) {
    console.error('Error extracting image path from URL:', error);
    return null;
  }
};

// Helper function to delete image from storage
const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const imagePath = extractImagePathFromUrl(imageUrl);
    if (!imagePath) {
      console.warn('Could not extract image path from URL:', imageUrl);
      return;
    }

    console.log('Deleting image from storage:', imagePath);
    const { error } = await supabase.storage
      .from('food-images')
      .remove([imagePath]);

    if (error) {
      console.error('Error deleting image from storage:', error);
    } else {
      console.log('Image deleted successfully from storage');
    }
  } catch (error) {
    console.error('Error in deleteImageFromStorage:', error);
  }
};

export const useFoodProcessing = (addEntry: AddEntryFn) => {
  const [processingFoods, setProcessingFoods] = useState<ProcessingFood[]>([]);
  const { uploadImageWithAnalysis, clearError, error: foodCaptureError, isCompressing } = useFoodCapture();
  const { sendToWebhookWithResponse } = useWebhookResponse();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkLimitWithoutFetch, showLimitReachedToast } = useOptimizedUsageLimits();
  const { toast } = useToast();

  const runAnalysis = async (blob: Blob, id: string, imageSrc: string, supabaseUrl?: string) => {
    clearError();
    
    // Verificar límites sin hacer fetch innecesario
    if (!isPremium) {
      const limitCheck = checkLimitWithoutFetch('nutrition_photos', isPremium);
      if (!limitCheck.canProceed) {
        showLimitReachedToast('nutrition_photos');
        setProcessingFoods(prev => prev.filter(p => p.id !== id));
        URL.revokeObjectURL(imageSrc);
        if (supabaseUrl) {
          await deleteImageFromStorage(supabaseUrl);
        }
        return;
      }
    }

    try {
      let result;
      let finalSupabaseUrl = supabaseUrl;

      if (supabaseUrl) {
        // Use existing Supabase URL for retry - just send to webhook
        console.log('Using existing Supabase URL for retry:', supabaseUrl);
        const analysisResult = await sendToWebhookWithResponse(supabaseUrl, blob);
        
        if (analysisResult) {
          result = {
            imageUrl: supabaseUrl,
            fileName: extractImagePathFromUrl(supabaseUrl) || '',
            analysisResult
          };
        }
      } else {
        // First time - upload to Supabase and analyze
        result = await uploadImageWithAnalysis(blob);
        finalSupabaseUrl = result?.imageUrl;
      }

      if (result && result.analysisResult) {
        const analysis = result.analysisResult;
        
        // Check if food was actually detected - improved logic
        const hasValidName = analysis.name && 
          !analysis.name.toLowerCase().includes('no food') && 
          !analysis.name.toLowerCase().includes('not food') &&
          !analysis.name.toLowerCase().includes('no se detectó') &&
          !analysis.name.toLowerCase().includes('no detectado');
        
        if (!hasValidName) {
          // Delete image from storage since it's not useful
          if (finalSupabaseUrl) {
            await deleteImageFromStorage(finalSupabaseUrl);
          }
          
          const errorMessage = "¡Hey, eso no se come! Intenta de nuevo";
          toast({
            title: "Comida no detectada",
            description: errorMessage,
            variant: "destructive",
          });
          setProcessingFoods(prev => prev.map(p => p.id === id ? { ...p, error: errorMessage, supabaseUrl: finalSupabaseUrl } : p));
          return;
        }

        // Ensure minimum calorie value for valid food
        const validCalories = Math.max(analysis.calories || 0, 1);
        
        const newEntryData: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'> = {
          custom_food_name: analysis.name || 'Alimento Analizado',
          quantity_consumed: analysis.servingSize || 1,
          unit_consumed: analysis.servingUnit || 'porción',
          calories_consumed: validCalories,
          protein_g_consumed: analysis.protein || 0,
          carbs_g_consumed: analysis.carbs || 0,
          fat_g_consumed: analysis.fat || 0,
          health_score: analysis.healthScore,
          ingredients: analysis.ingredients,
          photo_url: result.imageUrl,
          meal_type: 'snack1',
        };
        
        const savedEntry = await addEntry(newEntryData);
        
        if (savedEntry) {
          // Incrementar uso solo después de éxito completo
          if (!isPremium) {
            console.log('📈 [FOOD PROCESSING] Incrementing nutrition usage after successful analysis');
            await incrementUsage('nutrition_photos');
          }
          
          setProcessingFoods(prev => prev.filter(p => p.id !== id));
          URL.revokeObjectURL(imageSrc);
          
          toast({
            title: "¡Comida analizada!",
            description: `Se ha agregado ${analysis.name || 'tu comida'} al registro`,
          });
        } else {
          throw new Error("No se pudo guardar la entrada de comida");
        }
      } else {
        const errorMessage = foodCaptureError || "No se pudo analizar la comida. Revisa tu conexión o la imagen.";
        toast({
          title: "Error de Análisis",
          description: errorMessage,
          variant: "destructive",
        });
        setProcessingFoods(prev => prev.map(p => p.id === id ? { ...p, error: errorMessage, supabaseUrl: finalSupabaseUrl } : p));
      }
    } catch (error) {
      console.error("Error processing food:", error);
      const errorMessage = foodCaptureError || "Ocurrió un error al procesar la imagen.";
      toast({
        title: "Error Inesperado",
        description: errorMessage,
        variant: "destructive",
      });
      setProcessingFoods(prev => prev.map(p => p.id === id ? { ...p, error: errorMessage } : p));
    }
  };

  const handlePhotoTaken = async (photoBlob: Blob) => {
    const tempId = Date.now().toString();
    const imageSrc = URL.createObjectURL(photoBlob);

    setProcessingFoods(prev => [{ id: tempId, imageSrc, blob: photoBlob, error: null }, ...prev]);
    await runAnalysis(photoBlob, tempId, imageSrc);
  };

  const handleRetryAnalysis = async (foodId: string) => {
    const foodToRetry = processingFoods.find(f => f.id === foodId);
    if (!foodToRetry) return;

    // Verificar límites sin hacer fetch innecesario
    if (!isPremium) {
      const limitCheck = checkLimitWithoutFetch('nutrition_photos', isPremium);
      if (!limitCheck.canProceed) {
        showLimitReachedToast('nutrition_photos');
        handleCancelProcessing(foodId);
        return;
      }
    }

    setProcessingFoods(prev => prev.map(p => p.id === foodId ? { ...p, error: null } : p));
    await runAnalysis(foodToRetry.blob, foodToRetry.id, foodToRetry.imageSrc, foodToRetry.supabaseUrl);
  };

  const handleCancelProcessing = async (foodId: string) => {
    const foodToRemove = processingFoods.find(f => f.id === foodId);
    if (foodToRemove) {
      URL.revokeObjectURL(foodToRemove.imageSrc);
      
      // Delete image from storage if it exists
      if (foodToRemove.supabaseUrl) {
        await deleteImageFromStorage(foodToRemove.supabaseUrl);
      }
      
      setProcessingFoods(prev => prev.filter(p => p.id !== foodId));
    }
  };
  
  return {
    processingFoods,
    handlePhotoTaken,
    handleRetryAnalysis,
    handleCancelProcessing,
    isCompressing
  };
};
