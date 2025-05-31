
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
}

export const usePublicProfile = (userId?: string) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      // Obtener perfil básico
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, is_profile_public')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Verificar si el perfil es público
      if (!profileData.is_profile_public) {
        setProfile(null);
        return;
      }

      // Obtener nivel actual del usuario
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_level')
        .eq('user_id', userId)
        .single();

      setProfile({
        ...profileData,
        current_level: streakData?.current_level || 1
      });
    } catch (error) {
      console.error('Error fetching public profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return { profile, loading, refetch: fetchProfile };
};
