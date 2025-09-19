import { useState, useEffect, useCallback } from 'react';
import { useAdminNutritionProgram, AdminNutritionIngredient } from './useAdminNutritionProgram';
import { useFoodLog } from './useFoodLog';
import { useToast } from './use-toast';
import { FoodLogEntry } from '@/types/foodLog';
import { useNavigate } from 'react-router-dom';

export const useNutritionProgramPage = (selectedDate: Date) => {
  const navigate = useNavigate();
  const { nutritionPlan, loading } = useAdminNutritionProgram(selectedDate);
  const { addEntry } = useFoodLog(selectedDate.toISOString().split('T')[0]);
  const { toast } = useToast();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Reset initialization when date changes
  useEffect(() => {
    console.log('Date changed, resetting initialization');
    setInitialized(false);
    setSelectedOptions({});
    setCheckedIngredients({});
    setIngredientQuantities({});
  }, [selectedDate.toDateString()]);

  // Initialize selected options and quantities when nutrition plan loads (only once per plan)
  useEffect(() => {
    if (nutritionPlan?.meals && !initialized) {
      console.log('Initializing nutrition plan data');
      const initialOptions: Record<string, number> = {};
      const initialQuantities: Record<string, number> = {};
      
      nutritionPlan.meals.forEach(meal => {
        if (meal.options && meal.options.length > 0) {
          initialOptions[meal.id] = 0; // Select first option by default
          
          // Initialize quantities for all ingredients
          meal.options.forEach(option => {
            option.ingredients?.forEach(ingredient => {
              initialQuantities[ingredient.id] = ingredient.quantity_grams;
            });
          });
        }
      });
      
      setSelectedOptions(initialOptions);
      setIngredientQuantities(initialQuantities);
      setInitialized(true);
      console.log('Nutrition plan initialized');
    }
  }, [nutritionPlan?.id, initialized]); // Only depend on plan ID, not the whole object

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

  const handleQuantityChange = useCallback((ingredientId: string, quantity: number) => {
    setIngredientQuantities(prev => ({
      ...prev,
      [ingredientId]: quantity
    }));
  }, []);

  const convertIngredientToFoodLogEntry = (ingredient: AdminNutritionIngredient, quantity: number): Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'> => {
    // Calculate scaled macros based on quantity
    const scale = quantity / ingredient.quantity_grams;
    
    return {
      food_item_id: null,
      meal_type: 'other' as any,
      custom_food_name: ingredient.custom_food_name || 'Alimento del plan nutricional',
      quantity_consumed: quantity,
      unit_consumed: 'g',
      calories_consumed: ingredient.calories_per_serving * scale,
      protein_g_consumed: ingredient.protein_g_per_serving * scale,
      carbs_g_consumed: ingredient.carbs_g_per_serving * scale,
      fat_g_consumed: ingredient.fats_g_per_serving * scale,
      health_score: null,
      ingredients: null,
      notes: 'Agregado desde plan nutricional programado',
      photo_url: null
    };
  };

  const handleSaveMeals = useCallback(async (specificIngredients?: AdminNutritionIngredient[]) => {
    if (!nutritionPlan?.meals) return;

    setSaving(true);
    let savedCount = 0;
    let errorCount = 0;

    try {
      // Collect ingredients to save (either specific ones or all checked ones)
      const ingredientsToSave: { ingredient: AdminNutritionIngredient; quantity: number }[] = [];
      
      if (specificIngredients) {
        // Save only the specific ingredients passed (for recipe save)
        specificIngredients.forEach(ingredient => {
          if (checkedIngredients[ingredient.id]) {
            const quantity = ingredientQuantities[ingredient.id] || ingredient.quantity_grams;
            ingredientsToSave.push({ ingredient, quantity });
          }
        });
      } else {
        // Collect all checked ingredients (for main save button)
        nutritionPlan.meals.forEach(meal => {
          const selectedOptionIndex = selectedOptions[meal.id] || 0;
          const selectedOption = meal.options?.[selectedOptionIndex];
          
          if (selectedOption?.ingredients) {
            selectedOption.ingredients.forEach(ingredient => {
              if (checkedIngredients[ingredient.id]) {
                const quantity = ingredientQuantities[ingredient.id] || ingredient.quantity_grams;
                ingredientsToSave.push({ ingredient, quantity });
              }
            });
          }
        });
      }

      if (ingredientsToSave.length === 0) {
        toast({
          title: "Sin ingredientes seleccionados",
          description: "Selecciona al menos un ingrediente para guardar.",
          variant: "destructive"
        });
        return;
      }

      // Save each ingredient as a food log entry
      for (const { ingredient, quantity } of ingredientsToSave) {
        try {
          const foodLogEntry = convertIngredientToFoodLogEntry(ingredient, quantity);
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
        
        // Clear selections for saved ingredients
        if (specificIngredients) {
          const newCheckedIngredients = { ...checkedIngredients };
          specificIngredients.forEach(ingredient => {
            delete newCheckedIngredients[ingredient.id];
          });
          setCheckedIngredients(newCheckedIngredients);
        } else {
          // Clear all selections after successful save
          setCheckedIngredients({});
          // Navigate back to nutrition page only for main save
          navigate('/nutrition');
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
  }, [nutritionPlan, selectedOptions, checkedIngredients, ingredientQuantities, addEntry, toast, navigate]);

  return {
    nutritionPlan,
    selectedOptions,
    checkedIngredients,
    ingredientQuantities,
    loading,
    saving,
    handleOptionSelect,
    handleIngredientCheck,
    handleQuantityChange,
    handleSaveMeals
  };
};