import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export const useAdminNutritionProgram = (selectedDate: Date) => {
  const { toast } = useToast();
  const [nutritionPlan, setNutritionPlan] = useState<AdminNutritionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasNutritionPlan, setHasNutritionPlan] = useState(false);
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);

  const fetchAdminNutritionPlan = useCallback(async (dateToFetch: Date) => {
    // Ensure we're working with the correct date by normalizing to UTC
    const normalizedDate = new Date(dateToFetch.getFullYear(), dateToFetch.getMonth(), dateToFetch.getDate());
    const dateString = normalizedDate.toISOString().split('T')[0];
    
    // Avoid refetching if we already have data for this date
    if (lastFetchedDate === dateString && nutritionPlan) {
      console.log('Skipping fetch - already have data for', dateString);
      return;
    }

    console.log('Fetching admin nutrition plan for date:', dateString);
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        return;
      }

      // Verificar si el usuario tiene un programa admin activo
      const { data: adminPrograms, error: adminError } = await supabase
        .from('user_assigned_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (adminError) throw adminError;

      if (!adminPrograms || adminPrograms.length === 0) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
        return;
      }

      const adminAssignment = adminPrograms[0];
      
      // Calcular día actual del programa - fix timezone issues
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
      // Fix day of week calculation - use normalized date
      const jsDay = normalizedDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Monday, 6=Sunday

      console.log('Admin nutrition plan calculation:', { 
        weekNumber, 
        dayOfWeek, 
        daysDiff, 
        dateToFetch: normalizedDate.toISOString(),
        jsDay,
        startDate: startDateNormalized.toISOString(),
        dateString 
      });

      // Buscar plan nutricional para este día
      const { data: nutritionPlanData, error: nutritionError } = await supabase
        .from('admin_program_nutrition_plans' as any)
        .select('*')
        .eq('program_id', adminAssignment.program_id)
        .eq('week_number', weekNumber)
        .eq('day_of_week', dayOfWeek)
        .limit(1);

      if (nutritionError) throw nutritionError;

      if (nutritionPlanData && nutritionPlanData.length > 0) {
        const nutritionPlanRef = nutritionPlanData[0];
        
        // Obtener detalles del plan nutricional con información completa de recetas
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
                    name
                  )
                )
              )
            )
          `)
          .eq('id', (nutritionPlanRef as any).nutrition_plan_id)
          .limit(1);

        if (planError) throw planError;

        if (planDetails && planDetails.length > 0) {
          const planData = planDetails[0];
          
          // Enrich ingredients with recipe information
          if (planData.meals) {
            for (const meal of planData.meals) {
              if (meal.options) {
                for (const option of meal.options) {
                  if (option.ingredients) {
                    // Get all unique recipe IDs from ingredients
                    const recipeIds = [...new Set(
                      option.ingredients
                        .filter(ing => ing.recipe_id)
                        .map(ing => ing.recipe_id)
                    )];
                    
                    // Fetch recipe details for all recipes in this option
                    if (recipeIds.length > 0) {
                      const { data: recipesData } = await supabase
                        .from('recipes')
                        .select('id, name, description, instructions, cover_image_url')
                        .in('id', recipeIds);
                      
                      // Enrich ingredients with recipe data
                      if (recipesData) {
                        option.ingredients.forEach((ingredient: any) => {
                          if (ingredient.recipe_id) {
                            const recipeData = recipesData.find(r => r.id === ingredient.recipe_id);
                            if (recipeData) {
                              ingredient.recipe_name = recipeData.name;
                              ingredient.recipe_description = recipeData.description;
                              ingredient.recipe_instructions = recipeData.instructions;
                              ingredient.recipe_image_url = recipeData.cover_image_url;
                            }
                          }
                        });
                      }
                    }
                  }
                }
              }
            }
          }
          
          setNutritionPlan(planData as any);
          setHasNutritionPlan(true);
          setLastFetchedDate(dateString);
          console.log('Admin nutrition plan found:', planData);
        } else {
          setNutritionPlan(null);
          setHasNutritionPlan(false);
          setLastFetchedDate(dateString);
        }
      } else {
        // Aún hay programa admin, pero no plan nutricional para este día
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
      }

    } catch (error: any) {
      console.error("Error fetching admin nutrition plan:", error);
      // Don't use toast here to avoid infinite loop
      setNutritionPlan(null);
      setHasNutritionPlan(false);
      setLastFetchedDate(dateString);
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent infinite loop

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
    refetch: () => fetchAdminNutritionPlan(selectedDate)
  };
};