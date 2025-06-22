
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { FoodLogEntry } from '@/types/foodLog';
import { validateAndSanitizeEntry, convertDbEntryToFoodLogEntry } from '@/utils/foodLogValidation';
import { createSecureErrorMessage, logSecurityEvent } from '@/utils/errorHandling';
import { useLocalTimezone } from './useLocalTimezone';
import { useFoodLogProfile } from './useFoodLogProfile';

export const useFoodLogOperations = () => {
  const { getCurrentLocalDate } = useLocalTimezone();
  const { ensureUserProfile, updateUserStreak } = useFoodLogProfile();

  const addEntry = async (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>): Promise<FoodLogEntry | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logSecurityEvent('unauthorized_food_entry', 'User not authenticated');
        throw new Error('Usuario no autenticado');
      }

      const sanitizedEntry = validateAndSanitizeEntry(entry);

      await ensureUserProfile(user.id);

      const now = new Date();
      const newEntry = {
        ...sanitizedEntry,
        user_id: user.id,
        logged_at: now.toISOString(),
        log_date: getCurrentLocalDate(),
        ingredients: sanitizedEntry.ingredients ? sanitizedEntry.ingredients as Json : null
      };

      console.log('Inserting validated food entry with local date:', newEntry.log_date);

      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      await updateUserStreak();
      
      return convertDbEntryToFoodLogEntry(data);
    } catch (err) {
      logSecurityEvent('food_entry_error', 'Failed to add food entry');
      throw err;
    }
  };

  const updateEntry = async (id: number, updates: Partial<FoodLogEntry>): Promise<boolean> => {
    try {
      const sanitizedUpdates: any = {};
      
      if (updates.custom_food_name !== undefined) {
        sanitizedUpdates.custom_food_name = updates.custom_food_name;
      }
      if (updates.calories_consumed !== undefined) {
        sanitizedUpdates.calories_consumed = updates.calories_consumed;
      }
      if (updates.protein_g_consumed !== undefined) {
        sanitizedUpdates.protein_g_consumed = updates.protein_g_consumed;
      }
      if (updates.carbs_g_consumed !== undefined) {
        sanitizedUpdates.carbs_g_consumed = updates.carbs_g_consumed;
      }
      if (updates.fat_g_consumed !== undefined) {
        sanitizedUpdates.fat_g_consumed = updates.fat_g_consumed;
      }
      if (updates.ingredients !== undefined) {
        sanitizedUpdates.ingredients = updates.ingredients as Json;
      }

      const { error } = await supabase
        .from('daily_food_log_entries')
        .update(sanitizedUpdates)
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (err) {
      logSecurityEvent('food_update_error', 'Failed to update food entry');
      throw err;
    }
  };

  const deleteEntry = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('daily_food_log_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (err) {
      logSecurityEvent('food_delete_error', 'Failed to delete food entry');
      throw err;
    }
  };

  return {
    addEntry,
    updateEntry,
    deleteEntry
  };
};
