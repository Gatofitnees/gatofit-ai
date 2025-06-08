import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { sanitizeFoodName, validateCalories, validateMacronutrient } from '@/utils/validation';
import { createSecureErrorMessage, logSecurityEvent } from '@/utils/errorHandling';
import { useTimezone } from './useTimezone';

export interface FoodLogEntry {
  id?: number;
  food_item_id?: number;
  custom_food_name: string;
  photo_url?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2';
  quantity_consumed: number;
  unit_consumed: string;
  calories_consumed: number;
  protein_g_consumed: number;
  carbs_g_consumed: number;
  fat_g_consumed: number;
  health_score?: number;
  ingredients?: Array<{
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  notes?: string;
  logged_at: string;
  log_date: string;
}

// Helper function to convert Json to ingredients array
const parseIngredients = (ingredientsJson: Json | null): FoodLogEntry['ingredients'] => {
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

export const useFoodLog = (selectedDate?: string) => {
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getUserCurrentDateString, timezoneInfo } = useTimezone();

  const ensureUserProfile = async (userId: string) => {
    try {
      console.log('Checking if user profile exists for:', userId);
      
      // Check if profile exists using maybeSingle to avoid errors when no data is found
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking profile:', checkError);
        throw checkError;
      }

      if (!existingProfile) {
        console.log('Creating profile for user:', userId);
        
        // Create profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
        
        console.log('Profile created successfully for user:', userId);
      } else {
        console.log('Profile already exists for user:', userId);
      }
    } catch (err) {
      console.error('Error ensuring user profile:', err);
      throw err;
    }
  };

  const fetchEntriesForDate = async (date?: string) => {
    try {
      setIsLoading(true);
      // Use user's timezone-aware date if no specific date provided
      const queryDate = date || getUserCurrentDateString();
      
      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .select('*')
        .eq('log_date', queryDate)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      
      // Convert and validate entries
      const convertedEntries: FoodLogEntry[] = (data || []).map(entry => ({
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
      }));
      
      setEntries(convertedEntries);
    } catch (err) {
      const secureError = createSecureErrorMessage(err, 'database');
      setError(secureError);
      logSecurityEvent('food_fetch_error', 'Failed to fetch food entries');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('update_user_streak', {
        p_user_id: user.id,
        p_user_timezone_offset: timezoneInfo.timezoneOffset
      });
    } catch (err) {
      console.error('Error updating user streak:', err);
    }
  };

  const addEntry = async (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>): Promise<FoodLogEntry | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logSecurityEvent('unauthorized_food_entry', 'User not authenticated');
        throw new Error('Usuario no autenticado');
      }

      // Validate and sanitize entry data
      const sanitizedEntry = {
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

      await ensureUserProfile(user.id);

      // Use user's timezone-aware date and time
      const userDate = getUserCurrentDateString();
      const now = new Date(); // Current UTC time for logging
      
      const newEntry = {
        ...sanitizedEntry,
        user_id: user.id,
        logged_at: now.toISOString(),
        log_date: userDate, // Use user's date
        ingredients: sanitizedEntry.ingredients ? sanitizedEntry.ingredients as Json : null
      };

      console.log('Inserting validated food entry with user date:', userDate);

      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      await updateUserStreak();
      await fetchEntriesForDate(selectedDate);
      
      // Convert back to FoodLogEntry format
      const returnEntry: FoodLogEntry = {
        id: data.id,
        food_item_id: data.food_item_id || undefined,
        custom_food_name: sanitizeFoodName(data.custom_food_name || ''),
        photo_url: data.photo_url || undefined,
        meal_type: data.meal_type,
        quantity_consumed: validateMacronutrient(data.quantity_consumed),
        unit_consumed: sanitizeFoodName(data.unit_consumed || ''),
        calories_consumed: validateCalories(data.calories_consumed),
        protein_g_consumed: validateMacronutrient(data.protein_g_consumed),
        carbs_g_consumed: validateMacronutrient(data.carbs_g_consumed),
        fat_g_consumed: validateMacronutrient(data.fat_g_consumed),
        health_score: data.health_score || undefined,
        ingredients: parseIngredients(data.ingredients),
        notes: sanitizeFoodName(data.notes || ''),
        logged_at: data.logged_at,
        log_date: data.log_date
      };
      
      return returnEntry;
    } catch (err) {
      const secureError = createSecureErrorMessage(err, 'database');
      setError(secureError);
      logSecurityEvent('food_entry_error', 'Failed to add food entry');
      return null;
    }
  };

  const updateEntry = async (id: number, updates: Partial<FoodLogEntry>): Promise<boolean> => {
    try {
      // Validate and sanitize updates
      const sanitizedUpdates: any = {};
      
      if (updates.custom_food_name !== undefined) {
        sanitizedUpdates.custom_food_name = sanitizeFoodName(updates.custom_food_name);
      }
      if (updates.calories_consumed !== undefined) {
        sanitizedUpdates.calories_consumed = validateCalories(updates.calories_consumed);
      }
      if (updates.protein_g_consumed !== undefined) {
        sanitizedUpdates.protein_g_consumed = validateMacronutrient(updates.protein_g_consumed);
      }
      if (updates.carbs_g_consumed !== undefined) {
        sanitizedUpdates.carbs_g_consumed = validateMacronutrient(updates.carbs_g_consumed);
      }
      if (updates.fat_g_consumed !== undefined) {
        sanitizedUpdates.fat_g_consumed = validateMacronutrient(updates.fat_g_consumed);
      }
      if (updates.ingredients !== undefined) {
        sanitizedUpdates.ingredients = updates.ingredients?.map(ingredient => ({
          name: sanitizeFoodName(ingredient.name),
          grams: validateMacronutrient(ingredient.grams),
          calories: validateCalories(ingredient.calories),
          protein: validateMacronutrient(ingredient.protein),
          carbs: validateMacronutrient(ingredient.carbs),
          fat: validateMacronutrient(ingredient.fat)
        })) as Json;
      }

      const { error } = await supabase
        .from('daily_food_log_entries')
        .update(sanitizedUpdates)
        .eq('id', id);

      if (error) throw error;

      await fetchEntriesForDate(selectedDate);
      return true;
    } catch (err) {
      const secureError = createSecureErrorMessage(err, 'database');
      setError(secureError);
      logSecurityEvent('food_update_error', 'Failed to update food entry');
      return false;
    }
  };

  const deleteEntry = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('daily_food_log_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchEntriesForDate(selectedDate);
      return true;
    } catch (err) {
      const secureError = createSecureErrorMessage(err, 'database');
      setError(secureError);
      logSecurityEvent('food_delete_error', 'Failed to delete food entry');
      return false;
    }
  };

  useEffect(() => {
    fetchEntriesForDate(selectedDate);
  }, [selectedDate]);

  return {
    entries,
    isLoading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: () => fetchEntriesForDate(selectedDate)
  };
};
