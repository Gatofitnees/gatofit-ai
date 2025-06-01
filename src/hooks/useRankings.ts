
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
      
      const orderColumn = type === 'streak' ? 'current_streak' : 'total_experience';
      
      console.log('Fetching rankings from user_rankings view...');
      
      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .order(orderColumn, { ascending: false })
        .limit(20);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Rankings data received:', data);
      
      // If no data from view, try to get data from profiles and user_streaks
      if (!data || data.length === 0) {
        console.log('No data from user_rankings view, trying alternative query...');
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            full_name,
            avatar_url,
            user_streaks!inner(
              current_streak,
              total_experience,
              current_level
            )
          `)
          .not('user_streaks.current_streak', 'is', null)
          .order('user_streaks.current_streak', { ascending: false })
          .limit(20);

        if (profilesError) throw profilesError;

        // Transform the data to match RankingUser interface
        const transformedData = profilesData?.map(profile => ({
          user_id: profile.id,
          username: profile.username || profile.full_name || `Usuario #${profile.id.substring(0, 8)}`,
          avatar_url: profile.avatar_url,
          current_streak: (profile.user_streaks as any)[0]?.current_streak || 0,
          total_experience: (profile.user_streaks as any)[0]?.total_experience || 0,
          current_level: (profile.user_streaks as any)[0]?.current_level || 1,
          rank_name: 'Principiante', // Default rank name
          total_workouts: 0,
          followers_count: 0,
          following_count: 0
        })) || [];

        setRankings(transformedData);
      } else {
        setRankings(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching rankings:', err);
      setError('Error al cargar clasificaciones');
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
