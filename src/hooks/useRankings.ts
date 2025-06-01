
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
      
      console.log('Fetching all users with profile and streak data...');
      
      // Obtener todos los usuarios con sus perfiles y datos de streak (usando LEFT JOIN)
      const { data: profilesData, error: profilesError } = await supabase
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
        .eq('is_profile_public', true)
        .order(type === 'streak' ? 'user_streaks.current_streak' : 'user_streaks.total_experience', { ascending: false, nullsFirst: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles data received:', profilesData);

      // Transformar los datos y proporcionar valores por defecto
      const transformedData = profilesData?.map(profile => {
        const streakData = Array.isArray(profile.user_streaks) ? profile.user_streaks[0] : profile.user_streaks;
        
        return {
          user_id: profile.id,
          username: profile.username || profile.full_name || `Usuario #${profile.id.substring(0, 8)}`,
          avatar_url: profile.avatar_url,
          current_streak: streakData?.current_streak || 0,
          total_experience: streakData?.total_experience || 0,
          current_level: streakData?.current_level || 1,
          rank_name: 'Principiante', // Default rank name
          total_workouts: 0,
          followers_count: 0,
          following_count: 0
        };
      }) || [];

      // Ordenar según el tipo seleccionado
      const sortedData = transformedData.sort((a, b) => {
        if (type === 'streak') {
          return b.current_streak - a.current_streak;
        } else {
          return b.total_experience - a.total_experience;
        }
      });

      console.log('Final transformed and sorted data:', sortedData);
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
