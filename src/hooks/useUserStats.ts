
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (targetUserId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_user_stats', {
        target_user_id: targetUserId
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats({
          total_workouts: Number(data[0].total_workouts),
          followers_count: Number(data[0].followers_count),
          following_count: Number(data[0].following_count),
          total_workout_hours: Number(data[0].total_workout_hours)
        });
      }
    } catch (err) {
      setError('Error al cargar estadísticas');
      console.error('Error fetching user stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchStats(userId);
    }
  }, [userId]);

  return {
    stats,
    isLoading,
    error,
    refetch: () => userId && fetchStats(userId)
  };
};
