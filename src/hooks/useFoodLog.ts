
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useFoodLog = () => {
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

  const fetchTodayEntries = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .select('*')
        .eq('log_date', today)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError('Error al cargar las comidas');
      console.error('Error fetching food entries:', err);
    } finally {
      setIsLoading(false);
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
        log_date: now.toISOString().split('T')[0]
      };

      console.log('Inserting food entry:', newEntry);

      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      await fetchTodayEntries();
      return data;
    } catch (err) {
      setError('Error al guardar la comida');
      console.error('Error adding food entry:', err);
      return null;
    }
  };

  const updateEntry = async (id: number, updates: Partial<FoodLogEntry>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('daily_food_log_entries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchTodayEntries();
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
        .delete()
        .from('daily_food_log_entries')
        .eq('id', id);

      if (error) throw error;

      await fetchTodayEntries();
      return true;
    } catch (err) {
      setError('Error al eliminar la comida');
      console.error('Error deleting food entry:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchTodayEntries();
  }, []);

  return {
    entries,
    isLoading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchTodayEntries
  };
};
