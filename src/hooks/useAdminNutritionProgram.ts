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
          .order('meal_order', { referencedTable: 'nutrition_plan_meals' })
          .order('option_order', { referencedTable: 'nutrition_plan_meal_options' })
          .limit(1);

        if (planError) throw planError;

        if (planDetails && planDetails.length > 0) {
          const planData = planDetails[0];
          
          // Debug: log the raw data first
          console.log('Raw plan data from database:', JSON.stringify(planData, null, 2));
          
          // Debug: Check meal options ordering specifically for Almuerzo
          const almuerzoMeal = planData.meals?.find(meal => meal.meal_name === 'Almuerzo');
          if (almuerzoMeal && almuerzoMeal.options) {
            console.log('=== ALMUERZO OPTIONS ORDER DEBUG ===');
            almuerzoMeal.options.forEach((option, index) => {
              console.log(`Array index ${index}: option_order=${option.option_order}, option_name="${option.option_name}", ingredients=${option.ingredients?.length || 0}`);
            });
            console.log('=== END ALMUERZO DEBUG ===');
          }
          
          // Enrich ingredients with recipe information
          if (planData.meals) {
            // First, ensure proper ordering of meals and their options
            planData.meals.sort((a, b) => (a.meal_order || 0) - (b.meal_order || 0));
            
            for (const meal of planData.meals) {
              if (meal.options) {
                // Ensure options are properly ordered by option_order
                meal.options.sort((a, b) => (a.option_order || 0) - (b.option_order || 0));
                
                // Debug: Log the sorted options for Almuerzo
                if (meal.meal_name === 'Almuerzo') {
                  console.log('=== ALMUERZO OPTIONS AFTER SORTING ===');
                  meal.options.forEach((option, index) => {
                    console.log(`Array index ${index}: option_order=${option.option_order}, option_name="${option.option_name}", ingredients=${option.ingredients?.length || 0}`);
                  });
                  console.log('=== END ALMUERZO SORTED DEBUG ===');
                }
                
                for (const option of meal.options) {
                  if (option.ingredients) {
                    console.log(`Processing ingredients for meal option ${option.option_name}:`, option.ingredients.length, 'ingredients');
                    console.log('Raw ingredients before processing:', option.ingredients.map(ing => ({
                      id: ing.id,
                      name: ing.custom_food_name || 'No name',
                      recipe_id: ing.recipe_id,
                      recipe_name: ing.recipe_name,
                      quantity: ing.quantity_grams,
                      calories: ing.calories_per_serving
                    })));
                    
                    // Check for ingredients that already have recipe data from the original query
                    option.ingredients.forEach((ingredient: any) => {
                      console.log('Ingredient data:', {
                        id: ingredient.id,
                        custom_food_name: ingredient.custom_food_name,
                        recipe_id: ingredient.recipe_id,
                        recipe_name: (ingredient as any).recipe_name,
                        food_items: ingredient.food_items
                      });
                      
                      // If ingredient has recipe data from the nutrition_plan_meal_ingredients table
                      if ((ingredient as any).recipe_name && (ingredient as any).recipe_name.trim() !== '') {
                        console.log('Ingredient already has recipe info from database');
                        // Use the recipe data that's already in the ingredient
                        // The recipe_name, recipe_description, recipe_instructions, recipe_image_url 
                        // should already be populated from the nutrition_plan_meal_ingredients table
                      }
                    });
                    
                    // Get all unique recipe IDs from ingredients that have recipe_id
                    const recipeIds = [...new Set(
                      option.ingredients
                        .filter(ing => ing.recipe_id)
                        .map(ing => ing.recipe_id)
                    )];
                    
                    // Fetch recipe details and ingredients for all recipes in this option
                    if (recipeIds.length > 0) {
                      console.log('Fetching recipe data for IDs:', recipeIds);
                      
                      // Fetch recipe basic info
                      const { data: recipesData, error: recipeError } = await supabase
                        .from('recipes')
                        .select('id, name, description, instructions, cover_image_url')
                        .in('id', recipeIds);
                      
                      if (recipeError) {
                        console.error('Error fetching recipe data:', recipeError);
                      }
                      
                      // Fetch actual recipe ingredients from recipe_ingredients table
                      const { data: recipeIngredientsData, error: recipeIngredientsError } = await supabase
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
                        .in('recipe_id', recipeIds);
                      
                      if (recipeIngredientsError) {
                        console.error('Error fetching recipe ingredients:', recipeIngredientsError);
                      }
                      
                      // Process recipe ingredients and replace placeholders
                      if (recipesData && recipeIngredientsData) {
                        console.log('Recipe data fetched:', recipesData);
                        console.log('Recipe ingredients data fetched:', recipeIngredientsData);
                        
                        // Create a new ingredients array without recipe placeholders
                        const newIngredients: any[] = [];
                        
                        option.ingredients.forEach((ingredient: any) => {
                          if (ingredient.recipe_id) {
                            // This is a recipe placeholder - replace with actual recipe ingredients
                            const recipeData = recipesData.find(r => r.id === ingredient.recipe_id);
                            const recipeIngredients = recipeIngredientsData.filter(ri => ri.recipe_id === ingredient.recipe_id);
                            
                            if (recipeData && recipeIngredients.length > 0) {
                              console.log(`Replacing recipe placeholder ${ingredient.id} with ${recipeIngredients.length} real ingredients`);
                              
                              // Add each recipe ingredient as a separate ingredient
                              recipeIngredients.forEach((recipeIngredient: any) => {
                                const foodItem = recipeIngredient.food_items;
                                if (foodItem) {
                                  // Calculate nutritional values based on the recipe ingredient quantity
                                  const servingRatio = recipeIngredient.quantity_grams / 100; // Assuming food_items nutrition is per 100g
                                  
                                  newIngredients.push({
                                    id: `${ingredient.id}_${recipeIngredient.id}`, // Unique ID combining original and recipe ingredient
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
                              });
                            }
                          } else {
                            // This is a regular ingredient, keep as is
                            newIngredients.push(ingredient);
                          }
                        });
                        
                        // Replace the ingredients array with the new one
                        option.ingredients = newIngredients;
                        console.log(`Replaced ingredients for option ${option.option_name}:`, newIngredients.length, 'ingredients');
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