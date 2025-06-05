
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_profile_public: boolean | null;
  current_level?: number;
  current_streak?: number;
  total_workouts?: number;
  followers_count?: number;
  following_count?: number;
}

export const usePublicProfile = (userId?: string) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching profile for user:', userId);
      
      // Single query to get all profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          username, 
          avatar_url, 
          bio, 
          is_profile_public
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profileData) {
        throw new Error('Usuario no encontrado');
      }

      // Check if profile is public
      if (!profileData.is_profile_public) {
        setError('Este perfil no es público');
        setProfile(null);
        setIsLoading(false);
        return;
      }

      console.log('Profile data:', profileData);

      // Get user stats and streak data in parallel
      const [statsResponse, streakResponse] = await Promise.all([
        supabase.rpc('get_user_stats', { target_user_id: userId }),
        supabase
          .from('user_streaks')
          .select('current_level, current_streak')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      console.log('Stats response:', statsResponse);
      console.log('Streak response:', streakResponse);

      const statsData = statsResponse.data;
      const streakData = streakResponse.data;

      // Combine all data
      const completeProfile: PublicProfile = {
        ...profileData,
        current_level: streakData?.current_level || 1,
        current_streak: streakData?.current_streak || 0,
        total_workouts: Number(statsData?.total_workouts) || 0,
        followers_count: Number(statsData?.followers_count) || 0,
        following_count: Number(statsData?.following_count) || 0
      };

      console.log('Complete profile:', completeProfile);
      setProfile(completeProfile);
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      setError(error.message || 'Error al cargar el perfil');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const refetch = async () => {
    await fetchProfile();
  };

  return { 
    profile, 
    isLoading, 
    error, 
    refetch 
  };
};
