
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

interface ProfileWithStreaks {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_profile_public: boolean;
  user_streaks: Array<{
    current_streak: number;
    total_experience: number;
    current_level: number;
  }> | null;
}

export const useRankings = () => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async (type: RankingType = 'streak') => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching all registered users for rankings...');
      
      // Get all users with public profiles and their streak data
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          is_profile_public,
          user_streaks (
            current_streak,
            total_experience,
            current_level
          )
        `)
        .eq('is_profile_public', true)
        .not('username', 'is', null)
        .returns<ProfileWithStreaks[]>();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Users data received:', data);
      
      if (!data || data.length === 0) {
        console.log('No public users found');
        setRankings([]);
        return;
      }

      // Transform the data to match RankingUser interface
      const transformedData = data.map(profile => {
        const streakData = profile.user_streaks?.[0];
        
        return {
          user_id: profile.id,
          username: profile.username || profile.full_name || `Usuario #${profile.id.substring(0, 8)}`,
          avatar_url: profile.avatar_url,
          current_streak: streakData?.current_streak || 0,
          total_experience: streakData?.total_experience || 0,
          current_level: streakData?.current_level || 1,
          rank_name: 'Gatito Novato', // Default rank name
          total_workouts: 0,
          followers_count: 0,
          following_count: 0
        };
      });

      // Sort users based on the selected type
      const sortedData = transformedData.sort((a, b) => {
        if (type === 'streak') {
          return b.current_streak - a.current_streak;
        } else {
          return b.total_experience - a.total_experience;
        }
      });

      setRankings(sortedData);
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
