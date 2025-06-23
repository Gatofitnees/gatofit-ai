
import { useState } from 'react';
import { useFoodCapture } from './useFoodCapture';
import { useWebhookResponse } from './useWebhookResponse';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FoodLogEntry } from './useFoodLog';

type AddEntryFn = (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>) => Promise<FoodLogEntry | null>;

export interface ProcessingFood {
    id: string;
    imageSrc: string;
    blob: Blob;
    supabaseUrl?: string;
    fileName?: string;
    error?: string | null;
    isCompleting?: boolean;
    isCancelling?: boolean;
}

export const useFoodProcessing = (addEntry: AddEntryFn) => {
  const [processingFoods, setProcessingFoods] = useState<ProcessingFood[]>([]);
  const { uploadImageWithAnalysis, clearError, error: foodCaptureError, isCompressing } = useFoodCapture();
  const { sendToWebhookWithResponse } = useWebhookResponse();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkLimitWithoutFetch, showLimitReachedToast } = useUsageLimits();
  const { toast } = useToast();

  const deleteImageFromStorage = async (fileName: string) => {
    if (!fileName) return;
    
    try {
      const { error } = await supabase.storage
        .from('food-images')
        .remove([fileName]);
      
      if (error) {
        console.warn('Failed to delete image from storage:', error);
      } else {
        console.log('Image deleted from storage:', fileName);
      }
    } catch (error) {
      console.warn('Error deleting image from storage:', error);
    }
  };

  const runAnalysis = async (blob: Blob, id: string, imageSrc: string, existingSupabaseUrl?: string, existingFileName?: string) => {
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
      let result;
      
      // Si tenemos URL existente, usarla para reintento
      if (existingSupabaseUrl && existingFileName) {
        console.log('Using existing Supabase image for retry:', existingSupabaseUrl);
        const analysisResult = await sendToWebhookWithResponse(existingSupabaseUrl, blob);
        
        if (analysisResult) {
          result = {
            imageUrl: existingSupabaseUrl,
            fileName: existingFileName,
            analysisResult
          };
        } else {
          result = null;
        }
      } else {
        // Primera vez, subir imagen
        result = await uploadImageWithAnalysis(blob);
        
        // Actualizar ProcessingFood con la URL de Supabase
        if (result) {
          setProcessingFoods(prev => prev.map(p => 
            p.id === id ? { 
              ...p, 
              supabaseUrl: result.imageUrl, 
              fileName: result.fileName 
            } : p
          ));
        }
      }

      if (result && result.analysisResult) {
        const analysis = result.analysisResult;
        
        // Verificar si realmente se detectó comida válida - LÓGICA CORREGIDA
        const hasValidName = analysis.name && 
                           !analysis.name.toLowerCase().includes('no food') && 
                           !analysis.name.toLowerCase().includes('no se detectó') &&
                           analysis.name.trim().length > 0;
        
        // Un alimento es válido si tiene nombre válido, aunque tenga 0 calorías
        if (!hasValidName) {
          console.log('No valid food name detected in analysis:', analysis);
          const noFoodMessage = "Intenta con una foto más clara";
          
          setProcessingFoods(prev => prev.map(p => 
            p.id === id ? { ...p, error: noFoodMessage } : p
          ));
          
          // Eliminar imagen del storage si es el primer intento
          if (!existingSupabaseUrl && result.fileName) {
            await deleteImageFromStorage(result.fileName);
          }
          return;
        }

        const newEntryData: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'> = {
          custom_food_name: analysis.name || 'Alimento Analizado',
          quantity_consumed: analysis.servingSize || 1,
          unit_consumed: analysis.servingUnit || 'porción',
          calories_consumed: Math.max(analysis.calories || 0, 1), // Asegurar al menos 1 caloría
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
          
          // Marcar como completando para animación de salida
          setProcessingFoods(prev => prev.map(p => 
            p.id === id ? { ...p, isCompleting: true } : p
          ));
          
          toast({
            title: "¡Comida analizada!",
            description: `Se ha agregado ${analysis.name || 'tu comida'} al registro`,
          });
        } else {
          throw new Error("No se pudo guardar la entrada de comida");
        }
      } else {
        // Manejar caso cuando no hay resultado de análisis
        const errorMessage = foodCaptureError || "Intenta con una foto más clara";
        console.log('No analysis result received');
        
        setProcessingFoods(prev => prev.map(p => p.id === id ? { ...p, error: errorMessage } : p));
        
        // Eliminar imagen del storage si es el primer intento
        if (!existingSupabaseUrl && result?.fileName) {
          await deleteImageFromStorage(result.fileName);
        }
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
    
    // Usar imagen existente si está disponible
    await runAnalysis(
      foodToRetry.blob, 
      foodToRetry.id, 
      foodToRetry.imageSrc,
      foodToRetry.supabaseUrl,
      foodToRetry.fileName
    );
  };

  const handleCancelProcessing = async (foodId: string) => {
    const foodToRemove = processingFoods.find(f => f.id === foodId);
    if (!foodToRemove) return;
    
    // Eliminar imagen del storage si existe
    if (foodToRemove.fileName) {
      await deleteImageFromStorage(foodToRemove.fileName);
    }
    
    // Marcar como cancelando para animación
    setProcessingFoods(prev => prev.map(p => 
      p.id === foodId ? { ...p, isCancelling: true } : p
    ));
  };

  // Limpiar elementos después de animaciones
  const handleAnimationComplete = (foodId: string) => {
    const foodToRemove = processingFoods.find(f => f.id === foodId);
    if (foodToRemove) {
      URL.revokeObjectURL(foodToRemove.imageSrc);
    }
    setProcessingFoods(prev => prev.filter(p => p.id !== foodId));
  };
  
  return {
    processingFoods,
    handlePhotoTaken,
    handleRetryAnalysis,
    handleCancelProcessing,
    handleAnimationComplete,
    isCompressing
  };
};
