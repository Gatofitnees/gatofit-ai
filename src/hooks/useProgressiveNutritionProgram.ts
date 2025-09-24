import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminNutritionProgram, AdminNutritionIngredient } from './useAdminNutritionProgram';
import { useFoodLog } from './useFoodLog';
import { useToast } from './use-toast';
import { FoodLogEntry } from '@/types/foodLog';
import { useNavigate } from 'react-router-dom';

export const useProgressiveNutritionProgram = (selectedDate: Date) => {
  const navigate = useNavigate();
  const { nutritionPlan, loading: planLoading } = useAdminNutritionProgram(selectedDate);
  const { addEntry } = useFoodLog(selectedDate.toISOString().split('T')[0]);
  const { toast } = useToast();

  // Progressive loading states
  const [loadedMeals, setLoadedMeals] = useState<Set<string>>(new Set());
  const [loadedOptions, setLoadedOptions] = useState<Record<string, Set<number>>>({});
  const [loadingMeals, setLoadingMeals] = useState<Set<string>>(new Set());
  const [loadingOptions, setLoadingOptions] = useState<Record<string, Set<number>>>({});
  
  // User interaction states
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Refs for intersection observer
  const mealRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset states when date changes
  useEffect(() => {
    setLoadedMeals(new Set());
    setLoadedOptions({});
    setLoadingMeals(new Set());
    setLoadingOptions({});
    setSelectedOptions({});
    setCheckedIngredients({});
    setIngredientQuantities({});
    setShowSaveModal(false);
    mealRefs.current = {};
  }, [selectedDate.toDateString()]);

  // Initialize first meal when nutrition plan loads
  useEffect(() => {
    if (nutritionPlan?.meals && nutritionPlan.meals.length > 0 && loadedMeals.size === 0) {
      const firstMeal = nutritionPlan.meals[0];
      loadMeal(firstMeal.id, 0); // Load first meal with first option
    }
  }, [nutritionPlan?.id]);

  // Setup intersection observer for progressive loading
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id.startsWith('meal-')) {
            const mealId = entry.target.id.replace('meal-', '');
            if (!loadedMeals.has(mealId) && !loadingMeals.has(mealId)) {
              loadMeal(mealId, 0); // Load with first option
            }
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.1,
      }
    );

    // Observe existing meal elements
    Object.values(mealRefs.current).forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [nutritionPlan?.meals, loadedMeals, loadingMeals]);

  const loadMeal = useCallback(async (mealId: string, optionIndex: number) => {
    if (!nutritionPlan?.meals) return;

    const meal = nutritionPlan.meals.find(m => m.id === mealId);
    if (!meal) return;

    // Mark meal as loading
    setLoadingMeals(prev => new Set([...prev, mealId]));
    setLoadingOptions(prev => ({
      ...prev,
      [mealId]: new Set([...(prev[mealId] || []), optionIndex])
    }));

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Mark meal as loaded
      setLoadedMeals(prev => new Set([...prev, mealId]));
      setLoadedOptions(prev => ({
        ...prev,
        [mealId]: new Set([...(prev[mealId] || []), optionIndex])
      }));

      // Initialize selected option and quantities
      setSelectedOptions(prev => ({
        ...prev,
        [mealId]: optionIndex
      }));

      const selectedOption = meal.options?.[optionIndex];
      if (selectedOption?.ingredients) {
        const newQuantities: Record<string, number> = {};
        selectedOption.ingredients.forEach(ingredient => {
          newQuantities[ingredient.id] = ingredient.quantity_grams;
        });
        
        setIngredientQuantities(prev => ({
          ...prev,
          ...newQuantities
        }));
      }
    } catch (error) {
      console.error('Error loading meal:', error);
      toast({
        title: "Error de carga",
        description: "No se pudo cargar esta comida. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      // Remove from loading states
      setLoadingMeals(prev => {
        const newSet = new Set(prev);
        newSet.delete(mealId);
        return newSet;
      });
      setLoadingOptions(prev => ({
        ...prev,
        [mealId]: new Set([...(prev[mealId] || [])].filter(i => i !== optionIndex))
      }));
    }
  }, [nutritionPlan, toast]);

  const loadOption = useCallback(async (mealId: string, optionIndex: number) => {
    if (loadedOptions[mealId]?.has(optionIndex)) return;

    setLoadingOptions(prev => ({
      ...prev,
      [mealId]: new Set([...(prev[mealId] || []), optionIndex])
    }));

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      setLoadedOptions(prev => ({
        ...prev,
        [mealId]: new Set([...(prev[mealId] || []), optionIndex])
      }));
    } finally {
      setLoadingOptions(prev => ({
        ...prev,
        [mealId]: new Set([...(prev[mealId] || [])].filter(i => i !== optionIndex))
      }));
    }
  }, [loadedOptions]);

  const handleOptionSelect = useCallback(async (mealId: string, optionIndex: number) => {
    if (!nutritionPlan?.meals) return;
    
    const meal = nutritionPlan.meals.find(m => m.id === mealId);
    if (!meal?.options) return;
    
    // Load option if not already loaded
    if (!loadedOptions[mealId]?.has(optionIndex)) {
      await loadOption(mealId, optionIndex);
    }
    
    const selectedOption = meal.options[optionIndex];
    if (!selectedOption) return;
    
    // Update selected option
    setSelectedOptions(prev => ({
      ...prev,
      [mealId]: optionIndex
    }));
    
    // Clear checked ingredients for this meal
    setCheckedIngredients(prev => {
      const newChecked = { ...prev };
      meal.options.forEach(option => {
        option.ingredients?.forEach(ingredient => {
          delete newChecked[ingredient.id];
        });
      });
      return newChecked;
    });
    
    // Update quantities for the new option
    setIngredientQuantities(prev => {
      const newQuantities = { ...prev };
      
      // Clear previous option quantities
      meal.options.forEach(option => {
        option.ingredients?.forEach(ingredient => {
          delete newQuantities[ingredient.id];
        });
      });
      
      // Set new option quantities
      selectedOption.ingredients?.forEach(ingredient => {
        newQuantities[ingredient.id] = ingredient.quantity_grams;
      });
      
      return newQuantities;
    });
  }, [nutritionPlan, loadedOptions, loadOption]);

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

  const convertIngredientToFoodLogEntry = (ingredient: AdminNutritionIngredient, quantity: number, customName?: string): Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'> => {
    const scale = quantity / ingredient.quantity_grams;
    
    const foodName = customName || 
                    ingredient.custom_food_name || 
                    ingredient.food_items?.name || 
                    ingredient.recipe_name || 
                    'Alimento del plan nutricional';
    
    return {
      food_item_id: ingredient.food_items?.id || null,
      meal_type: 'breakfast',
      custom_food_name: foodName,
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

  const handleSaveMeals = useCallback(async (specificIngredients?: AdminNutritionIngredient[], customName?: string) => {
    if (!nutritionPlan?.meals) return;

    setSaving(true);
    let savedCount = 0;
    let errorCount = 0;

    try {
      const ingredientsToSave: { ingredient: AdminNutritionIngredient; quantity: number }[] = [];
      
      if (specificIngredients) {
        specificIngredients.forEach(ingredient => {
          if (checkedIngredients[ingredient.id]) {
            const quantity = ingredientQuantities[ingredient.id] || ingredient.quantity_grams;
            ingredientsToSave.push({ ingredient, quantity });
          }
        });
      } else {
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

      for (const { ingredient, quantity } of ingredientsToSave) {
        try {
          const foodLogEntry = convertIngredientToFoodLogEntry(ingredient, quantity, customName);
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
        
        if (specificIngredients) {
          const newCheckedIngredients = { ...checkedIngredients };
          specificIngredients.forEach(ingredient => {
            delete newCheckedIngredients[ingredient.id];
          });
          setCheckedIngredients(newCheckedIngredients);
        } else {
          setCheckedIngredients({});
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

  const handleOpenSaveModal = useCallback(() => {
    if (!nutritionPlan?.meals) return;
    
    const hasSelected = nutritionPlan.meals.some(meal => {
      const selectedOptionIndex = selectedOptions[meal.id] || 0;
      const selectedOption = meal.options?.[selectedOptionIndex];
      return selectedOption?.ingredients?.some(ingredient => checkedIngredients[ingredient.id]);
    });

    if (!hasSelected) {
      toast({
        title: "Sin ingredientes seleccionados",
        description: "Selecciona al menos un ingrediente para guardar.",
        variant: "destructive"
      });
      return;
    }

    setShowSaveModal(true);
  }, [nutritionPlan, selectedOptions, checkedIngredients, toast]);

  const handleSaveWithName = useCallback(async (customName?: string) => {
    setShowSaveModal(false);
    
    if (!nutritionPlan?.meals) return;

    setSaving(true);

    try {
      const ingredientsToSave: { ingredient: AdminNutritionIngredient; quantity: number }[] = [];
      
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

      if (ingredientsToSave.length === 0) {
        toast({
          title: "Sin ingredientes seleccionados",
          description: "Selecciona al menos un ingrediente para guardar.",
          variant: "destructive"
        });
        return;
      }

      const mealName = customName || 'Comida del plan nutricional';
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalQuantity = 0;
      
      const ingredients: any[] = [];
      const ingredientsList: string[] = [];

      for (const { ingredient, quantity } of ingredientsToSave) {
        const scale = quantity / ingredient.quantity_grams;
        
        totalCalories += ingredient.calories_per_serving * scale;
        totalProtein += ingredient.protein_g_per_serving * scale;
        totalCarbs += ingredient.carbs_g_per_serving * scale;
        totalFat += ingredient.fats_g_per_serving * scale;
        totalQuantity += quantity;
        
        const ingredientName = ingredient.custom_food_name || 
                             ingredient.food_items?.name || 
                             ingredient.recipe_name || 
                             'Ingrediente del plan';
        
        ingredients.push({
          name: ingredientName,
          grams: quantity,
          calories: ingredient.calories_per_serving * scale,
          protein: ingredient.protein_g_per_serving * scale,
          carbs: ingredient.carbs_g_per_serving * scale,
          fat: ingredient.fats_g_per_serving * scale
        });
        ingredientsList.push(`${ingredientName} (${quantity}g)`);
      }

      const result = await addEntry({
        food_item_id: null,
        meal_type: 'breakfast',
        custom_food_name: mealName,
        quantity_consumed: totalQuantity,
        unit_consumed: 'g',
        calories_consumed: totalCalories,
        protein_g_consumed: totalProtein,
        carbs_g_consumed: totalCarbs,
        fat_g_consumed: totalFat,
        health_score: null,
        ingredients: ingredients,
        notes: `Comida del plan nutricional: ${ingredientsList.join(', ')}`,
        photo_url: null
      });

      if (result) {
        toast({
          title: "¡Comida guardada!",
          description: `${mealName} se ha guardado con ${ingredientsToSave.length} ingredientes`,
        });
        
        setCheckedIngredients({});
        navigate('/nutrition');
      } else {
        throw new Error('No se pudo guardar la comida');
      }

    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar la comida. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [handleSaveMeals]);

  const getSelectedIngredients = useCallback(() => {
    if (!nutritionPlan?.meals) return [];
    
    const selectedIngredients: AdminNutritionIngredient[] = [];
    
    nutritionPlan.meals.forEach(meal => {
      const selectedOptionIndex = selectedOptions[meal.id] || 0;
      const selectedOption = meal.options?.[selectedOptionIndex];
      
      if (selectedOption?.ingredients) {
        selectedOption.ingredients.forEach(ingredient => {
          if (checkedIngredients[ingredient.id]) {
            selectedIngredients.push(ingredient);
          }
        });
      }
    });
    
    return selectedIngredients;
  }, [nutritionPlan, selectedOptions, checkedIngredients]);

  // Helper function to check if a meal is loaded
  const isMealLoaded = useCallback((mealId: string) => {
    return loadedMeals.has(mealId);
  }, [loadedMeals]);

  // Helper function to check if an option is loaded
  const isOptionLoaded = useCallback((mealId: string, optionIndex: number) => {
    return loadedOptions[mealId]?.has(optionIndex) || false;
  }, [loadedOptions]);

  // Helper function to check if a meal is loading
  const isMealLoading = useCallback((mealId: string) => {
    return loadingMeals.has(mealId);
  }, [loadingMeals]);

  // Helper function to check if an option is loading
  const isOptionLoading = useCallback((mealId: string, optionIndex: number) => {
    return loadingOptions[mealId]?.has(optionIndex) || false;
  }, [loadingOptions]);

  // Function to register meal refs for intersection observer
  const registerMealRef = useCallback((mealId: string, ref: HTMLDivElement | null) => {
    mealRefs.current[mealId] = ref;
    if (ref && observerRef.current) {
      observerRef.current.observe(ref);
    }
  }, []);

  return {
    nutritionPlan,
    selectedOptions,
    checkedIngredients,
    ingredientQuantities,
    loading: planLoading,
    saving,
    showSaveModal,
    handleOptionSelect,
    handleIngredientCheck,
    handleQuantityChange,
    handleSaveMeals,
    handleOpenSaveModal,
    handleSaveWithName,
    setShowSaveModal,
    getSelectedIngredients,
    // Progressive loading helpers
    isMealLoaded,
    isOptionLoaded,
    isMealLoading,
    isOptionLoading,
    registerMealRef,
    loadMeal
  };
};