import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminNutritionPlan {
  id: string;
  name: string;
  description?: string;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fats_g: number;
  duration_days?: number;
  difficulty_level?: string;
  meals?: AdminNutritionMeal[];
}

export interface AdminNutritionMeal {
  id: string;
  meal_name: string;
  meal_type: string;
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fats_g?: number;
  meal_order: number;
  options?: AdminNutritionMealOption[];
}

export interface AdminNutritionMealOption {
  id: string;
  option_name: string;
  description?: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fats_g: number;
  ingredients?: AdminNutritionIngredient[];
}

export interface AdminNutritionIngredient {
  id: string;
  custom_food_name?: string;
  quantity_grams: number;
  calories_per_serving: number;
  protein_g_per_serving: number;
  carbs_g_per_serving: number;
  fats_g_per_serving: number;
  fiber_g_per_serving: number;
  recipe_id?: string;
  recipe_name?: string;
  recipe_description?: string;
  recipe_instructions?: string;
  recipe_image_url?: string;
  food_items?: {
    id: number;
    name: string;
  };
}

/**
 * Optimized version of useAdminNutritionProgram with reduced database calls
 * and better performance for ingredient processing.
 */
export const useOptimizedAdminNutritionProgram = (selectedDate: Date) => {
  const [nutritionPlan, setNutritionPlan] = useState<AdminNutritionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasNutritionPlan, setHasNutritionPlan] = useState(false);
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);

  const fetchAdminNutritionPlan = useCallback(async (dateToFetch: Date) => {
    const normalizedDate = new Date(dateToFetch.getFullYear(), dateToFetch.getMonth(), dateToFetch.getDate());
    const dateString = normalizedDate.toISOString().split('T')[0];
    
    // Avoid refetching if we already have data for this date
    if (lastFetchedDate === dateString && nutritionPlan) {
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        return;
      }

      // Get active admin program
      const { data: adminPrograms, error: adminError } = await supabase
        .from('user_assigned_programs')
        .select('program_id, started_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (adminError || !adminPrograms || adminPrograms.length === 0) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
        return;
      }

      const adminAssignment = adminPrograms[0];
      
      // Calculate program day
      const startDate = new Date(adminAssignment.started_at);
      const startDateNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const daysDiff = Math.floor((normalizedDate.getTime() - startDateNormalized.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
        return;
      }

      const weekNumber = Math.floor(daysDiff / 7) + 1;
      const jsDay = normalizedDate.getDay();
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

      // Find nutrition plan for this day
      const { data: nutritionPlanData, error: nutritionError } = await supabase
        .from('admin_program_nutrition_plans' as any)
        .select('nutrition_plan_id')
        .eq('program_id', adminAssignment.program_id)
        .eq('week_number', weekNumber)
        .eq('day_of_week', dayOfWeek)
        .limit(1);

      if (nutritionError || !nutritionPlanData || nutritionPlanData.length === 0) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
        return;
      }

      const nutritionPlanRef = nutritionPlanData[0];
      
      // Get plan details with optimized query
      const { data: planDetails, error: planError } = await supabase
        .from('nutrition_plans')
        .select(`
          *,
          meals:nutrition_plan_meals (
            *,
            options:nutrition_plan_meal_options (
              *,
              ingredients:nutrition_plan_meal_ingredients (
                *,
                food_items (
                  id,
                  name,
                  calories_per_serving,
                  protein_g_per_serving,
                  carbs_g_per_serving,
                  fat_g_per_serving,
                  fiber_g_per_serving
                )
              )
            )
          )
        `)
        .eq('id', (nutritionPlanRef as any).nutrition_plan_id)
        .order('meal_order', { referencedTable: 'nutrition_plan_meals' })
        .order('option_order', { referencedTable: 'nutrition_plan_meals.nutrition_plan_meal_options' })
        .order('ingredient_order', { referencedTable: 'nutrition_plan_meals.nutrition_plan_meal_options.nutrition_plan_meal_ingredients' })
        .limit(1);

      if (planError || !planDetails || planDetails.length === 0) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
        return;
      }

      const planData = planDetails[0];
      
      // Process ingredients efficiently (without recipe expansion for now)
      // Recipe expansion can be done lazily when needed
      if (planData.meals) {
        for (const meal of planData.meals) {
          if (meal.options) {
            // Sort options by option_order
            meal.options.sort((a: any, b: any) => (a.option_order || 0) - (b.option_order || 0));
            
            for (const option of meal.options) {
              if (option.ingredients) {
                // Sort ingredients by ingredient_order
                option.ingredients.sort((a: any, b: any) => (a.ingredient_order || 0) - (b.ingredient_order || 0));
              }
            }
          }
        }
        
        // Sort meals by meal_order
        planData.meals.sort((a: any, b: any) => (a.meal_order || 0) - (b.meal_order || 0));
      }
      
      setNutritionPlan(planData as AdminNutritionPlan);
      setHasNutritionPlan(true);
      setLastFetchedDate(dateString);

    } catch (error: any) {
      console.error("Error fetching admin nutrition plan:", error);
      setNutritionPlan(null);
      setHasNutritionPlan(false);
      setLastFetchedDate(dateString);
    } finally {
      setLoading(false);
    }
  }, [nutritionPlan, lastFetchedDate]);

  // Lazy load recipe details when needed
  const expandRecipeIngredients = useCallback(async (mealOptionId: string) => {
    if (!nutritionPlan) return;

    try {
      // Find the meal option that needs recipe expansion
      for (const meal of nutritionPlan.meals || []) {
        for (const option of meal.options || []) {
          if (option.id === mealOptionId && option.ingredients) {
            // Get recipe IDs that need expansion
            const recipeIds = [...new Set(
              option.ingredients
                .filter(ing => ing.recipe_id && !ing.recipe_name)
                .map(ing => ing.recipe_id!)
            )];

            if (recipeIds.length === 0) return;

            // Batch fetch recipe data
            const [recipesResult, recipeIngredientsResult] = await Promise.all([
              supabase
                .from('recipes')
                .select('id, name, description, instructions, cover_image_url')
                .in('id', recipeIds),
              supabase
                .from('recipe_ingredients')
                .select(`
                  *,
                  food_items (
                    id,
                    name,
                    calories_per_serving,
                    protein_g_per_serving,
                    carbs_g_per_serving,
                    fat_g_per_serving,
                    fiber_g_per_serving
                  )
                `)
                .in('recipe_id', recipeIds)
            ]);

            if (recipesResult.data && recipeIngredientsResult.data) {
              // Process and replace recipe placeholders
              const newIngredients: AdminNutritionIngredient[] = [];
              
              for (const ingredient of option.ingredients) {
                if (ingredient.recipe_id && !ingredient.recipe_name) {
                  // Expand recipe
                  const recipeData = recipesResult.data.find(r => r.id === ingredient.recipe_id);
                  const recipeIngredients = recipeIngredientsResult.data.filter(ri => ri.recipe_id === ingredient.recipe_id);
                  
                  if (recipeData && recipeIngredients.length > 0) {
                    for (const recipeIngredient of recipeIngredients) {
                      const foodItem = recipeIngredient.food_items;
                      if (foodItem) {
                        const servingRatio = recipeIngredient.quantity_grams / 100;
                        
                        newIngredients.push({
                          id: `${ingredient.id}_${recipeIngredient.id}`,
                          custom_food_name: recipeIngredient.custom_name || foodItem.name,
                          quantity_grams: recipeIngredient.quantity_grams,
                          calories_per_serving: (foodItem.calories_per_serving || 0) * servingRatio,
                          protein_g_per_serving: (foodItem.protein_g_per_serving || 0) * servingRatio,
                          carbs_g_per_serving: (foodItem.carbs_g_per_serving || 0) * servingRatio,
                          fats_g_per_serving: (foodItem.fat_g_per_serving || 0) * servingRatio,
                          fiber_g_per_serving: (foodItem.fiber_g_per_serving || 0) * servingRatio,
                          recipe_id: ingredient.recipe_id,
                          recipe_name: recipeData.name,
                          recipe_description: recipeData.description,
                          recipe_instructions: recipeData.instructions,
                          recipe_image_url: recipeData.cover_image_url,
                          food_items: {
                            id: foodItem.id,
                            name: foodItem.name
                          }
                        });
                      }
                    }
                  }
                } else {
                  // Keep regular ingredient
                  newIngredients.push(ingredient);
                }
              }
              
              // Update the option with expanded ingredients
              option.ingredients = newIngredients;
              setNutritionPlan({...nutritionPlan});
            }
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error expanding recipe ingredients:', error);
    }
  }, [nutritionPlan]);

  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    if (lastFetchedDate !== dateString) {
      fetchAdminNutritionPlan(selectedDate);
    }
  }, [selectedDate.toISOString().split('T')[0], fetchAdminNutritionPlan]);

  return {
    nutritionPlan,
    loading,
    hasNutritionPlan,
    expandRecipeIngredients,
    refetch: () => fetchAdminNutritionPlan(selectedDate)
  };
};
