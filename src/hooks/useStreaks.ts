
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserStreak {
  id: number;
  user_id: string;
  current_streak: number;
  last_activity_date: string | null;
  total_points: number;
  total_experience: number;
  current_level: number;
  experience_today: number;
  workouts_today: number;
  foods_today: number;
  last_xp_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useStreaks = () => {
  const [streakData, setStreakData] = useState<UserStreak | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreakData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setStreakData(data);
    } catch (err) {
      setError('Error al cargar datos de racha');
      console.error('Error fetching streak data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call the database function to update streak
      const { error } = await supabase.rpc('update_user_streak', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      // Refresh streak data
      await fetchStreakData();
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  };

  const cleanOldEntries = async () => {
    try {
      const { error } = await supabase.rpc('clean_old_food_entries');
      if (error) throw error;
    } catch (err) {
      console.error('Error cleaning old entries:', err);
    }
  };

  useEffect(() => {
    fetchStreakData();
    cleanOldEntries();
  }, []);

  return {
    streakData,
    isLoading,
    error,
    updateStreak,
    refetch: fetchStreakData
  };
};
