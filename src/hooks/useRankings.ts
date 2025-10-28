
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

export const useRankings = (limit?: number) => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async (type: RankingType = 'streak', customLimit?: number, coachId?: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Fetching all public users for rankings...');
      
      // Check current user authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error('Error de autenticación');
      }
      
      console.log('✅ Current user authenticated:', user?.id);
      
      // First get all public profiles with enhanced logging
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_profile_public')
        .eq('is_profile_public', true);

      if (profilesError) {
        console.error('❌ Profiles error:', profilesError);
        console.error('❌ Error details:', profilesError.message, profilesError.details, profilesError.hint);
        throw profilesError;
      }
      
      console.log('✅ Profiles data received:', profiles);
      console.log('📊 Number of public profiles found:', profiles?.length || 0);
      
      if (!profiles || profiles.length === 0) {
        console.log('⚠️ No public users found');
        setRankings([]);
        return;
      }

      // Log individual profiles
      profiles.forEach((profile, index) => {
        console.log(`👤 Profile ${index + 1}:`, {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          is_public: profile.is_profile_public
        });
      });

      // Filter by coach if coachId is provided
      let userIdsToFetch = profiles.map(p => p.id);

      if (coachId) {
        console.log('🔍 Filtering by coach_id:', coachId);
        
        // Get all users assigned to the same coach
        const { data: coachUsers, error: coachUsersError } = await supabase
          .from('coach_user_assignments')
          .select('user_id')
          .eq('coach_id', coachId);

        if (coachUsersError) {
          console.error('❌ Error fetching coach users:', coachUsersError);
        } else if (coachUsers && coachUsers.length > 0) {
          const coachUserIds = coachUsers.map(cu => cu.user_id);
          // Filter only public profiles that belong to users with the same coach
          userIdsToFetch = userIdsToFetch.filter(id => coachUserIds.includes(id));
          console.log('✅ Filtered user IDs by coach:', userIdsToFetch);
        } else {
          // If no users found for this coach, show empty list
          console.log('⚠️ No users assigned to coach:', coachId);
          userIdsToFetch = [];
        }
      }

      if (userIdsToFetch.length === 0) {
        console.log('⚠️ No users to fetch after filtering');
        setRankings([]);
        return;
      }

      console.log('🔢 User IDs to fetch streaks for:', userIdsToFetch);
      
      // Then get streak data for these users with enhanced logging
      const { data: streaks, error: streaksError } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak, total_experience, current_level')
        .in('user_id', userIdsToFetch);

      if (streaksError) {
        console.error('❌ Streaks error:', streaksError);
        console.error('❌ Streaks error details:', streaksError.message, streaksError.details, streaksError.hint);
        throw streaksError;
      }
      
      console.log('✅ Streaks data received:', streaks);
      console.log('📊 Number of streak records found:', streaks?.length || 0);

      // Filter profiles to only include those in userIdsToFetch
      const filteredProfiles = profiles.filter(p => userIdsToFetch.includes(p.id));

      // Transform and combine the data
      const transformedData = filteredProfiles.map((profile, index) => {
        // Find streak data for this user
        const streakData = streaks?.find(s => s.user_id === profile.id);
        
        // Use username if available, otherwise use full_name, otherwise create a default
        const displayName = profile.username || profile.full_name || `Usuario #${profile.id.substring(0, 8)}`;
        
        console.log(`🔄 Processing user ${index + 1}:`, {
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

      console.log('🔄 All transformed users before sorting:', transformedData);

      // Sort users based on the selected type
      const sortedData = transformedData.sort((a, b) => {
        if (type === 'streak') {
          return b.current_streak - a.current_streak;
        } else {
          return b.total_experience - a.total_experience;
        }
      });

      // Apply limit if specified
      const finalLimit = customLimit || limit;
      const limitedData = finalLimit ? sortedData.slice(0, finalLimit) : sortedData;

      console.log('✅ Final sorted and limited data:', limitedData);
      console.log('📊 Number of users in final ranking:', limitedData.length);
      
      setRankings(limitedData);
    } catch (err: any) {
      console.error('❌ Error fetching rankings:', err);
      setError(err.message || 'Error al cargar clasificaciones');
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
