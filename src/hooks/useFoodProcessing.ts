import { useState } from 'react';
import { useFoodCapture } from './useFoodCapture';
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
  const { toast } = useToast();

  const runAnalysis = async (blob: Blob, id: string, imageSrc: string) => {
    clearError();
    try {
      const result = await uploadImageWithAnalysis(blob);

      if (result && result.analysisResult) {
        const analysis = result.analysisResult;
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
        await addEntry(newEntryData);
        setProcessingFoods(prev => prev.filter(p => p.id !== id));
        URL.revokeObjectURL(imageSrc);
      } else {
        const errorMessage = foodCaptureError || "No se pudo analizar la comida. Revisa tu conexión o la imagen.";
        toast({
          title: "Error de Análisis",
          description: errorMessage,
          variant: "destructive",
        });
        setProcessingFoods(prev => prev.map(p => p.id === id ? { ...p, error: errorMessage } : p));
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

    setProcessingFoods(prev => prev.map(p => p.id === foodId ? { ...p, error: null } : p));
    await runAnalysis(foodToRetry.blob, foodToRetry.id, foodToRetry.imageSrc);
  };

  const handleCancelProcessing = (foodId: string) => {
    const foodToRemove = processingFoods.find(f => f.id === foodId);
    if (foodToRemove) {
      URL.revokeObjectURL(foodToRemove.imageSrc);
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
