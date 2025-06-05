
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
      console.log('Number of public profiles found:', profiles?.length || 0);
      
      if (!profiles || profiles.length === 0) {
        console.log('No public users found');
        setRankings([]);
        return;
      }

      // Get user IDs to fetch streaks
      const userIds = profiles.map(p => p.id);
      console.log('User IDs to fetch streaks for:', userIds);
      
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
      console.log('Number of streak records found:', streaks?.length || 0);

      // Transform and combine the data - ensure ALL profiles are included
      const transformedData = profiles.map((profile, index) => {
        // Find streak data for this user
        const streakData = streaks?.find(s => s.user_id === profile.id);
        
        // Use username if available, otherwise use full_name, otherwise create a default
        const displayName = profile.username || profile.full_name || `Usuario #${profile.id.substring(0, 8)}`;
        
        console.log(`Processing user ${index + 1}:`, {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          displayName,
          hasStreakData: !!streakData,
          streakData
        });
        
        const user: RankingUser = {
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
        
        return user;
      });

      console.log('All transformed users before sorting:', transformedData);

      // Sort users based on the selected type
      const sortedData = transformedData.sort((a, b) => {
        if (type === 'streak') {
          return b.current_streak - a.current_streak;
        } else {
          return b.total_experience - a.total_experience;
        }
      });

      console.log('Final sorted data:', sortedData);
      console.log('Number of users in final ranking:', sortedData.length);
      
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
