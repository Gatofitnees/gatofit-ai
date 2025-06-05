
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
      
      console.log('Fetching all public users for rankings...');
      
      // Get all users with public profiles and LEFT JOIN with user_streaks
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
        .eq('is_profile_public', true);

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
        // Handle user_streaks properly - it could be an array or null
        let streakData = null;
        if (profile.user_streaks && Array.isArray(profile.user_streaks) && profile.user_streaks.length > 0) {
          streakData = profile.user_streaks[0];
        }
        
        // Use username if available, otherwise use full_name, otherwise create a default
        const displayName = profile.username || profile.full_name || `Usuario #${profile.id.substring(0, 8)}`;
        
        return {
          user_id: profile.id,
          username: displayName,
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

      console.log('Transformed and sorted data:', sortedData);
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
