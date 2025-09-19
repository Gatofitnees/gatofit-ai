import { useState, useEffect, useCallback } from 'react';
import { useAdminNutritionProgram, AdminNutritionIngredient } from './useAdminNutritionProgram';
import { useFoodLog } from './useFoodLog';
import { useToast } from './use-toast';
import { FoodLogEntry } from '@/types/foodLog';

export const useNutritionProgramModal = (selectedDate: Date, onClose?: () => void) => {
  const { nutritionPlan, loading } = useAdminNutritionProgram(selectedDate);
  const { addEntry } = useFoodLog(selectedDate.toISOString().split('T')[0]);
  const { toast } = useToast();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Initialize selected options when nutrition plan loads
  useEffect(() => {
    if (nutritionPlan?.meals) {
      const initialOptions: Record<string, number> = {};
      nutritionPlan.meals.forEach(meal => {
        if (meal.options && meal.options.length > 0) {
          initialOptions[meal.id] = 0; // Select first option by default
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [nutritionPlan]);

  const handleOptionSelect = useCallback((mealId: string, optionIndex: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [mealId]: optionIndex
    }));
    
    // Clear checked ingredients when changing options
    setCheckedIngredients(prev => {
      const newChecked = { ...prev };
      // Find the meal and clear its ingredients
      const meal = nutritionPlan?.meals?.find(m => m.id === mealId);
      if (meal?.options) {
        meal.options.forEach(option => {
          option.ingredients?.forEach(ingredient => {
            delete newChecked[ingredient.id];
          });
        });
      }
      return newChecked;
    });
  }, [nutritionPlan]);

  const handleIngredientCheck = useCallback((ingredientId: string, checked: boolean) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [ingredientId]: checked
    }));
  }, []);

  const convertIngredientToFoodLogEntry = (ingredient: AdminNutritionIngredient): Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'> => {
    return {
      food_item_id: null,
      meal_type: 'other' as any,
      custom_food_name: ingredient.custom_food_name || 'Alimento del plan nutricional',
      quantity_consumed: ingredient.quantity_grams,
      unit_consumed: 'g',
      calories_consumed: ingredient.calories_per_serving,
      protein_g_consumed: ingredient.protein_g_per_serving,
      carbs_g_consumed: ingredient.carbs_g_per_serving,
      fat_g_consumed: ingredient.fats_g_per_serving,
      health_score: null,
      ingredients: null,
      notes: 'Agregado desde plan nutricional programado',
      photo_url: null
    };
  };

  const handleSaveMeals = useCallback(async () => {
    if (!nutritionPlan?.meals) return;

    setSaving(true);
    let savedCount = 0;
    let errorCount = 0;

    try {
      // Collect all checked ingredients
      const ingredientsToSave: AdminNutritionIngredient[] = [];
      
      nutritionPlan.meals.forEach(meal => {
        const selectedOptionIndex = selectedOptions[meal.id] || 0;
        const selectedOption = meal.options?.[selectedOptionIndex];
        
        if (selectedOption?.ingredients) {
          selectedOption.ingredients.forEach(ingredient => {
            if (checkedIngredients[ingredient.id]) {
              ingredientsToSave.push(ingredient);
            }
          });
        }
      });

      if (ingredientsToSave.length === 0) {
        toast({
          title: "Sin ingredientes seleccionados",
          description: "Selecciona al menos un ingrediente para guardar.",
          variant: "destructive"
        });
        return;
      }

      // Save each ingredient as a food log entry
      for (const ingredient of ingredientsToSave) {
        try {
          const foodLogEntry = convertIngredientToFoodLogEntry(ingredient);
          const result = await addEntry(foodLogEntry);
          
          if (result) {
            savedCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error saving ingredient:', error);
          errorCount++;
        }
      }

      if (savedCount > 0) {
        toast({
          title: "Comidas guardadas",
          description: `Se guardaron ${savedCount} alimento${savedCount > 1 ? 's' : ''} en tu registro nutricional.`,
          variant: "default"
        });
        
        // Clear selections after successful save
        setCheckedIngredients({});
        
        if (onClose) {
          onClose();
        }
      }

      if (errorCount > 0) {
        toast({
          title: "Algunos alimentos no se pudieron guardar",
          description: `${errorCount} alimento${errorCount > 1 ? 's no se pudieron' : ' no se pudo'} guardar.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error saving meals:', error);
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar las comidas. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [nutritionPlan, selectedOptions, checkedIngredients, addEntry, toast, onClose]);

  return {
    nutritionPlan,
    selectedOptions,
    checkedIngredients,
    loading,
    saving,
    handleOptionSelect,
    handleIngredientCheck,
    handleSaveMeals
  };
};