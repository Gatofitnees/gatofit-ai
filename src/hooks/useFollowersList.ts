
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FollowerUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export const useFollowersList = (userId?: string) => {
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFollowers = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          profiles!user_follows_follower_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', userId);

      if (error) throw error;

      const followersList = data.map(follow => ({
        id: follow.profiles.id,
        username: follow.profiles.username,
        full_name: follow.profiles.full_name,
        avatar_url: follow.profiles.avatar_url
      }));

      setFollowers(followersList);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowing = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          profiles!user_follows_following_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId);

      if (error) throw error;

      const followingList = data.map(follow => ({
        id: follow.profiles.id,
        username: follow.profiles.username,
        full_name: follow.profiles.full_name,
        avatar_url: follow.profiles.avatar_url
      }));

      setFollowing(followingList);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFollowers();
      fetchFollowing();
    }
  }, [userId]);

  return {
    followers,
    following,
    isLoading,
    refetch: () => {
      fetchFollowers();
      fetchFollowing();
    }
  };
};
