
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  total_workouts: number;
  followers_count: number;
  following_count: number;
  total_workout_hours: number;
}

export const useUserStats = (userId?: string) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', { target_user_id: userId });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return { stats, loading, refetch: fetchStats };
};
