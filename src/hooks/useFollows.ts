
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFollows = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const followUser = async (targetUserId: string) => {
    if (!user || user.id === targetUserId) return false;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        });

      if (error) throw error;
      return true;
    } catch (err) {
      setError('Error al seguir usuario');
      console.error('Error following user:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError('Error al dejar de seguir');
      console.error('Error unfollowing user:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFollowing = async (targetUserId: string) => {
    if (!user || user.id === targetUserId) return false;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;
      return data.length > 0;
    } catch (err) {
      console.error('Error checking follow status:', err);
      return false;
    }
  };

  return {
    followUser,
    unfollowUser,
    checkIfFollowing,
    isLoading,
    error
  };
};
