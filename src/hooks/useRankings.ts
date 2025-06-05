
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
      
      // First get all public profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_profile_public')
        .eq('is_profile_public', true);

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        throw profilesError;
      }
      
      console.log('Profiles data received:', profiles);
      
      if (!profiles || profiles.length === 0) {
        console.log('No public users found');
        setRankings([]);
        return;
      }

      // Get user IDs to fetch streaks
      const userIds = profiles.map(p => p.id);
      
      // Then get streak data for these users
      const { data: streaks, error: streaksError } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak, total_experience, current_level')
        .in('user_id', userIds);

      if (streaksError) {
        console.error('Streaks error:', streaksError);
        throw streaksError;
      }
      
      console.log('Streaks data received:', streaks);

      // Transform and combine the data
      const transformedData = profiles.map(profile => {
        // Find streak data for this user
        const streakData = streaks?.find(s => s.user_id === profile.id);
        
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
