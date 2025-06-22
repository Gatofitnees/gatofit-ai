
import type { Json } from '@/integrations/supabase/types';
import { FoodLogEntry } from '@/types/foodLog';
import { sanitizeFoodName, validateCalories, validateMacronutrient } from '@/utils/validation';

// Helper function to convert Json to ingredients array
export const parseIngredients = (ingredientsJson: Json | null): FoodLogEntry['ingredients'] => {
  if (!ingredientsJson) return undefined;
  
  try {
    if (Array.isArray(ingredientsJson)) {
      return ingredientsJson as FoodLogEntry['ingredients'];
    }
    
    if (typeof ingredientsJson === 'string') {
      const parsed = JSON.parse(ingredientsJson);
      return Array.isArray(parsed) ? parsed : undefined;
    }
    
    return undefined;
  } catch {
    return undefined;
  }
};

export const validateAndSanitizeEntry = (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>) => {
  return {
    ...entry,
    custom_food_name: sanitizeFoodName(entry.custom_food_name),
    unit_consumed: sanitizeFoodName(entry.unit_consumed),
    quantity_consumed: validateMacronutrient(entry.quantity_consumed),
    calories_consumed: validateCalories(entry.calories_consumed),
    protein_g_consumed: validateMacronutrient(entry.protein_g_consumed),
    carbs_g_consumed: validateMacronutrient(entry.carbs_g_consumed),
    fat_g_consumed: validateMacronutrient(entry.fat_g_consumed),
    health_score: entry.health_score ? Math.min(Math.max(entry.health_score, 1), 10) : undefined,
    notes: entry.notes ? sanitizeFoodName(entry.notes) : undefined,
    ingredients: entry.ingredients?.map(ingredient => ({
      name: sanitizeFoodName(ingredient.name),
      grams: validateMacronutrient(ingredient.grams),
      calories: validateCalories(ingredient.calories),
      protein: validateMacronutrient(ingredient.protein),
      carbs: validateMacronutrient(ingredient.carbs),
      fat: validateMacronutrient(ingredient.fat)
    }))
  };
};

export const convertDbEntryToFoodLogEntry = (entry: any): FoodLogEntry => ({
  id: entry.id,
  food_item_id: entry.food_item_id || undefined,
  custom_food_name: sanitizeFoodName(entry.custom_food_name || ''),
  photo_url: entry.photo_url || undefined,
  meal_type: entry.meal_type,
  quantity_consumed: validateMacronutrient(entry.quantity_consumed),
  unit_consumed: sanitizeFoodName(entry.unit_consumed || ''),
  calories_consumed: validateCalories(entry.calories_consumed),
  protein_g_consumed: validateMacronutrient(entry.protein_g_consumed),
  carbs_g_consumed: validateMacronutrient(entry.carbs_g_consumed),
  fat_g_consumed: validateMacronutrient(entry.fat_g_consumed),
  health_score: entry.health_score || undefined,
  ingredients: parseIngredients(entry.ingredients),
  notes: sanitizeFoodName(entry.notes || ''),
  logged_at: entry.logged_at,
  log_date: entry.log_date
});
