
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
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtener perfil básico
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, is_profile_public')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Verificar si el perfil es público
      if (!profileData.is_profile_public) {
        setError('Este perfil no es público');
        setProfile(null);
        return;
      }

      // Obtener datos del streak y nivel
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_level, current_streak')
        .eq('user_id', userId)
        .single();

      // Obtener estadísticas del usuario usando la función de base de datos
      const { data: statsData } = await supabase
        .rpc('get_user_stats', { target_user_id: userId })
        .single();

      setProfile({
        ...profileData,
        current_level: streakData?.current_level || 1,
        current_streak: streakData?.current_streak || 0,
        total_workouts: Number(statsData?.total_workouts) || 0,
        followers_count: Number(statsData?.followers_count) || 0,
        following_count: Number(statsData?.following_count) || 0
      });
    } catch (error: any) {
      console.error('Error fetching public profile:', error);
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
