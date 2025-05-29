
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
}

export type RankingType = 'streak' | 'experience';

export const useRankings = () => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async (type: RankingType = 'streak') => {
    try {
      setIsLoading(true);
      
      const orderColumn = type === 'streak' ? 'current_streak' : 'total_experience';
      
      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .order(orderColumn, { ascending: false })
        .limit(20);

      if (error) throw error;
      setRankings(data || []);
    } catch (err) {
      setError('Error al cargar clasificaciones');
      console.error('Error fetching rankings:', err);
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
