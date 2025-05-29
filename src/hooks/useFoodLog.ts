
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

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
    // If it's already an array, return it
    if (Array.isArray(ingredientsJson)) {
      return ingredientsJson as FoodLogEntry['ingredients'];
    }
    
    // If it's a string, try to parse it
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
      const queryDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .select('*')
        .eq('log_date', queryDate)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      
      // Convert the database entries to our FoodLogEntry type
      const convertedEntries: FoodLogEntry[] = (data || []).map(entry => ({
        id: entry.id,
        food_item_id: entry.food_item_id || undefined,
        custom_food_name: entry.custom_food_name || '',
        photo_url: entry.photo_url || undefined,
        meal_type: entry.meal_type,
        quantity_consumed: entry.quantity_consumed,
        unit_consumed: entry.unit_consumed || '',
        calories_consumed: entry.calories_consumed,
        protein_g_consumed: entry.protein_g_consumed,
        carbs_g_consumed: entry.carbs_g_consumed,
        fat_g_consumed: entry.fat_g_consumed,
        health_score: entry.health_score || undefined,
        ingredients: parseIngredients(entry.ingredients),
        notes: entry.notes || undefined,
        logged_at: entry.logged_at,
        log_date: entry.log_date
      }));
      
      setEntries(convertedEntries);
    } catch (err) {
      setError('Error al cargar las comidas');
      console.error('Error fetching food entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('update_user_streak', {
        p_user_id: user.id
      });
    } catch (err) {
      console.error('Error updating user streak:', err);
    }
  };

  const addEntry = async (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>): Promise<FoodLogEntry | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Ensure user profile exists before inserting food entry
      await ensureUserProfile(user.id);

      const now = new Date();
      const newEntry = {
        ...entry,
        user_id: user.id,
        logged_at: now.toISOString(),
        log_date: now.toISOString().split('T')[0],
        // Convert ingredients array to Json for database storage
        ingredients: entry.ingredients ? entry.ingredients as Json : null
      };

      console.log('Inserting food entry:', newEntry);

      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      // Update user streak after adding food entry
      await updateUserStreak();
      
      await fetchEntriesForDate(selectedDate);
      
      // Convert back to FoodLogEntry format
      const returnEntry: FoodLogEntry = {
        id: data.id,
        food_item_id: data.food_item_id || undefined,
        custom_food_name: data.custom_food_name || '',
        photo_url: data.photo_url || undefined,
        meal_type: data.meal_type,
        quantity_consumed: data.quantity_consumed,
        unit_consumed: data.unit_consumed || '',
        calories_consumed: data.calories_consumed,
        protein_g_consumed: data.protein_g_consumed,
        carbs_g_consumed: data.carbs_g_consumed,
        fat_g_consumed: data.fat_g_consumed,
        health_score: data.health_score || undefined,
        ingredients: parseIngredients(data.ingredients),
        notes: data.notes || undefined,
        logged_at: data.logged_at,
        log_date: data.log_date
      };
      
      return returnEntry;
    } catch (err) {
      setError('Error al guardar la comida');
      console.error('Error adding food entry:', err);
      return null;
    }
  };

  const updateEntry = async (id: number, updates: Partial<FoodLogEntry>): Promise<boolean> => {
    try {
      // Convert ingredients to Json format for database
      const dbUpdates = {
        ...updates,
        ingredients: updates.ingredients ? updates.ingredients as Json : undefined
      };

      const { error } = await supabase
        .from('daily_food_log_entries')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      await fetchEntriesForDate(selectedDate);
      return true;
    } catch (err) {
      setError('Error al actualizar la comida');
      console.error('Error updating food entry:', err);
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
      setError('Error al eliminar la comida');
      console.error('Error deleting food entry:', err);
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
