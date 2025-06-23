
import { useState } from 'react';
import { useFoodCapture } from './useFoodCapture';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useToast } from '@/hooks/use-toast';
import { FoodLogEntry } from './useFoodLog';

type AddEntryFn = (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>) => Promise<FoodLogEntry | null>;

export interface ProcessingFood {
    id: string;
    imageSrc: string;
    blob: Blob;
    error?: string | null;
}

export const useFoodProcessing = (addEntry: AddEntryFn) => {
  const [processingFoods, setProcessingFoods] = useState<ProcessingFood[]>([]);
  const { uploadImageWithAnalysis, clearError, error: foodCaptureError, isCompressing } = useFoodCapture();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkLimitWithoutFetch, showLimitReachedToast } = useUsageLimits();
  const { toast } = useToast();

  const runAnalysis = async (blob: Blob, id: string, imageSrc: string) => {
    clearError();
    
    // Verificar límites sin hacer fetch innecesario
    if (!isPremium) {
      const limitCheck = checkLimitWithoutFetch('nutrition_photos', isPremium);
      if (!limitCheck.canProceed) {
        showLimitReachedToast('nutrition_photos');
        setProcessingFoods(prev => prev.filter(p => p.id !== id));
        URL.revokeObjectURL(imageSrc);
        return;
      }
    }

    try {
      const result = await uploadImageWithAnalysis(blob);

      if (result && result.analysisResult) {
        const analysis = result.analysisResult;
        
        // Verificar si realmente se detectó comida válida
        if (!analysis.name || analysis.name.toLowerCase().includes('no food') || 
            analysis.name.toLowerCase().includes('no se detectó') ||
            analysis.calories === 0 || analysis.calories < 1) {
          
          console.log('No food detected in analysis:', analysis);
          const noFoodMessage = "No se detectó comida en la imagen. Intenta con una foto más clara del alimento.";
          
          setProcessingFoods(prev => prev.map(p => 
            p.id === id ? { ...p, error: noFoodMessage } : p
          ));
          return; // No guardar entrada si no se detectó comida
        }

        const newEntryData: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'> = {
          custom_food_name: analysis.name || 'Alimento Analizado',
          quantity_consumed: analysis.servingSize || 1,
          unit_consumed: analysis.servingUnit || 'porción',
          calories_consumed: analysis.calories || 0,
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
          
          // Usar setTimeout para asegurar transición suave
          setTimeout(() => {
            setProcessingFoods(prev => prev.filter(p => p.id !== id));
            URL.revokeObjectURL(imageSrc);
          }, 500); // Pequeño delay para transición más suave
          
          toast({
            title: "¡Comida analizada!",
            description: `Se ha agregado ${analysis.name || 'tu comida'} al registro`,
          });
        } else {
          throw new Error("No se pudo guardar la entrada de comida");
        }
      } else {
        // Manejar caso cuando no hay resultado de análisis
        const errorMessage = foodCaptureError || "No se detectó comida en la imagen. Intenta con una foto más clara del alimento.";
        console.log('No analysis result received');
        
        setProcessingFoods(prev => prev.map(p => p.id === id ? { ...p, error: errorMessage } : p));
      }
    } catch (error) {
      console.error("Error processing food:", error);
      const errorMessage = foodCaptureError || "Ocurrió un error al procesar la imagen.";
      
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

    // Limpiar error y volver a estado de procesamiento
    setProcessingFoods(prev => prev.map(p => p.id === foodId ? { ...p, error: null } : p));
    await runAnalysis(foodToRetry.blob, foodToRetry.id, foodToRetry.imageSrc);
  };

  const handleCancelProcessing = (foodId: string) => {
    const foodToRemove = processingFoods.find(f => f.id === foodId);
    if (foodToRemove) {
      URL.revokeObjectURL(foodToRemove.imageSrc);
    }
    
    // Usar setTimeout para transición más suave
    setTimeout(() => {
      setProcessingFoods(prev => prev.filter(p => p.id !== foodId));
    }, 200);
  };
  
  return {
    processingFoods,
    handlePhotoTaken,
    handleRetryAnalysis,
    handleCancelProcessing,
    isCompressing
  };
};
