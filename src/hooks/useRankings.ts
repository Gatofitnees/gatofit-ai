
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RankingUser {
  user_id: string;
  username: string;
  avatar_url: string | null;
  current_streak: number;
  total_experience: number;
  current_level: number;
  rank_name: string;
  total_workouts?: number;
  followers_count?: number;
  following_count?: number;
}

export type RankingType = 'streak' | 'experience';

export const useRankings = () => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async (type: RankingType = 'streak') => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching all users with profiles and streaks...');
      
      // Get all users with their profiles and streak data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          user_streaks (
            current_streak,
            total_experience,
            current_level
          )
        `)
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      console.log('Users data received:', usersData?.length || 0);

      if (usersData && usersData.length > 0) {
        // Transform and sort the data
        const transformedData = usersData.map(user => {
          const streakData = Array.isArray(user.user_streaks) && user.user_streaks.length > 0 
            ? user.user_streaks[0] 
            : null;

          return {
            user_id: user.id,
            username: user.username || user.full_name || `Usuario #${user.id.substring(0, 8)}`,
            avatar_url: user.avatar_url,
            current_streak: streakData?.current_streak || 0,
            total_experience: streakData?.total_experience || 0,
            current_level: streakData?.current_level || 1,
            rank_name: 'Principiante',
            total_workouts: 0,
            followers_count: 0,
            following_count: 0
          };
        });

        // Sort by the selected type
        const sortedData = transformedData.sort((a, b) => {
          const valueA = type === 'streak' ? a.current_streak : a.total_experience;
          const valueB = type === 'streak' ? b.current_streak : b.total_experience;
          return valueB - valueA;
        });

        setRankings(sortedData);
      } else {
        console.log('No users found, trying to get basic auth users...');
        
        // Fallback: try to get users from auth metadata (for newly registered users)
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        
        if (!authError && users) {
          const fallbackData = users.map(user => ({
            user_id: user.id,
            username: user.user_metadata?.name || user.email?.split('@')[0] || `Usuario #${user.id.substring(0, 8)}`,
            avatar_url: user.user_metadata?.avatar_url || null,
            current_streak: 0,
            total_experience: 0,
            current_level: 1,
            rank_name: 'Principiante',
            total_workouts: 0,
            followers_count: 0,
            following_count: 0
          }));
          
          setRankings(fallbackData);
        } else {
          setRankings([]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching rankings:', err);
      setError('Error al cargar clasificaciones');
      setRankings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return {
    rankings,
    isLoading,
    error,
    fetchRankings
  };
};
