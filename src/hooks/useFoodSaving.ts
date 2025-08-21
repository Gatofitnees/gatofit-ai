import { useState, useCallback } from 'react';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useToast } from '@/hooks/use-toast';

interface FoodSearchResult {
  id: string;
  name: string;
  description: string;
  brand?: string;
  nutrition?: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
    serving_size: string;
  };
}

export const useFoodSaving = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { addEntry } = useFoodLog();
  const { toast } = useToast();

  const saveFoods = useCallback(async (
    foods: FoodSearchResult[], 
    quantities: Record<string, number>,
    customName?: string
  ) => {
    if (foods.length === 0) return;

    setIsSaving(true);

    try {
      if (foods.length === 1) {
        // Single food - save directly
        const food = foods[0];
        const quantity = quantities[food.id] || 100;
        const multiplier = quantity / 100;

        if (!food.nutrition) {
          throw new Error('No hay información nutricional disponible');
        }

        await addEntry({
          custom_food_name: `${food.name}${food.brand ? ` (${food.brand})` : ''}`,
          quantity_consumed: quantity,
          unit_consumed: 'g',
          calories_consumed: food.nutrition.calories * multiplier,
          protein_g_consumed: food.nutrition.protein * multiplier,
          carbs_g_consumed: food.nutrition.carbs * multiplier,
          fat_g_consumed: food.nutrition.fat * multiplier,
          meal_type: 'lunch',
          notes: food.description,
        });

        toast({
          title: "¡Alimento guardado!",
          description: `${food.name} se ha guardado en tu registro`,
        });
      } else {
        // Multiple foods - create composite meal
        const mealName = customName || 'Comida personalizada';
        
        // Calculate totals
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let totalQuantity = 0;
        
        const ingredientsList: string[] = [];

        for (const food of foods) {
          const quantity = quantities[food.id] || 100;
          const multiplier = quantity / 100;

          if (food.nutrition) {
            totalCalories += food.nutrition.calories * multiplier;
            totalProtein += food.nutrition.protein * multiplier;
            totalCarbs += food.nutrition.carbs * multiplier;
            totalFat += food.nutrition.fat * multiplier;
          }
          
          totalQuantity += quantity;
          ingredientsList.push(`${food.name} (${quantity}g)${food.brand ? ` - ${food.brand}` : ''}`);
        }

        await addEntry({
          custom_food_name: mealName,
          quantity_consumed: totalQuantity,
          unit_consumed: 'g',
          calories_consumed: totalCalories,
          protein_g_consumed: totalProtein,
          carbs_g_consumed: totalCarbs,
          fat_g_consumed: totalFat,
          meal_type: 'lunch',
          notes: `Comida compuesta: ${ingredientsList.join(', ')}`,
        });

        toast({
          title: "¡Comida guardada!",
          description: `${mealName} se ha guardado con ${foods.length} alimentos`,
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving foods:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar alimentos';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [addEntry, toast]);

  return {
    saveFoods,
    isSaving,
  };
};