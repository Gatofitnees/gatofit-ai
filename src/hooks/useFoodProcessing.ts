
import { useState, useCallback } from 'react';
import { useFoodAnalysis } from './useFoodAnalysis';
import { useSecureFoodLog } from './useSecureFoodLog';
import { useToast } from '@/components/ui/use-toast';
import { useUsageLimits } from './useUsageLimits';
import { useSubscription } from './useSubscription';

export interface ProcessingFood {
  id: string;
  imageSrc: string;
  error?: string | null;
}

export const useFoodProcessing = () => {
  const [processingFoods, setProcessingFoods] = useState<ProcessingFood[]>([]);
  const { analyzeFood } = useFoodAnalysis();
  const { logFoodEntry } = useSecureFoodLog();
  const { incrementUsage } = useUsageLimits();
  const { isPremium } = useSubscription();
  const { toast } = useToast();

  const addProcessingFood = useCallback((imageSrc: string): string => {
    const id = Date.now().toString();
    setProcessingFoods(prev => [...prev, { id, imageSrc }]);
    return id;
  }, []);

  const removeProcessingFood = useCallback((id: string) => {
    setProcessingFoods(prev => prev.filter(food => food.id !== id));
  }, []);

  const updateProcessingFoodError = useCallback((id: string, error: string) => {
    setProcessingFoods(prev => 
      prev.map(food => 
        food.id === id ? { ...food, error } : food
      )
    );
  }, []);

  const processFood = useCallback(async (imageSrc: string) => {
    const processingId = addProcessingFood(imageSrc);
    
    try {
      console.log('🔄 [FOOD PROCESSING] Iniciando análisis de comida');
      
      // Analizar la comida
      const foodData = await analyzeFood(imageSrc);
      console.log('✅ [FOOD PROCESSING] Análisis completado:', foodData);

      // Guardar en la base de datos
      const success = await logFoodEntry(foodData);
      
      if (success) {
        console.log('✅ [FOOD PROCESSING] Entrada guardada exitosamente');
        
        // SOLO AQUÍ incrementar el contador después del éxito completo
        if (!isPremium) {
          console.log('📈 [FOOD PROCESSING] Incrementando contador de uso');
          const incrementSuccess = await incrementUsage('nutrition_photos');
          
          if (!incrementSuccess) {
            console.warn('⚠️ [FOOD PROCESSING] Error incrementando contador, pero comida ya guardada');
          }
        }
        
        removeProcessingFood(processingId);
        
        toast({
          title: "¡Comida añadida!",
          description: "Tu comida ha sido analizada y guardada correctamente.",
        });
      } else {
        throw new Error('Error guardando la entrada de comida');
      }
    } catch (error) {
      console.error('❌ [FOOD PROCESSING] Error procesando comida:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      updateProcessingFoodError(processingId, errorMessage);
      
      toast({
        title: "Error procesando comida",
        description: "Hubo un problema al analizar tu comida. Puedes reintentar.",
        variant: "destructive",
      });
    }
  }, [analyzeFood, logFoodEntry, incrementUsage, isPremium, addProcessingFood, removeProcessingFood, updateProcessingFoodError, toast]);

  const retryProcessing = useCallback(async (foodId: string) => {
    const food = processingFoods.find(f => f.id === foodId);
    if (!food) return;
    
    // Limpiar error y reintentar
    setProcessingFoods(prev => 
      prev.map(f => 
        f.id === foodId ? { ...f, error: null } : f
      )
    );
    
    await processFood(food.imageSrc);
  }, [processingFoods, processFood]);

  const cancelProcessing = useCallback((foodId: string) => {
    removeProcessingFood(foodId);
  }, [removeProcessingFood]);

  return {
    processingFoods,
    processFood,
    retryProcessing,
    cancelProcessing,
  };
};
