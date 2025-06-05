
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useFollows = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const loadFollowingUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;
      
      const followingIds = new Set(data.map(follow => follow.following_id));
      setFollowingUsers(followingIds);
    } catch (error) {
      console.error('Error loading following users:', error);
    }
  };

  const isFollowing = (userId: string): boolean => {
    return followingUsers.has(userId);
  };

  const followUser = async (userId: string) => {
    if (!user || user.id === userId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;
      
      setFollowingUsers(prev => new Set([...prev, userId]));
      toast({
        title: "Éxito",
        description: "Ahora sigues a este usuario"
      });
    } catch (error: any) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo seguir al usuario",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
      
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      toast({
        title: "Éxito",
        description: "Dejaste de seguir al usuario"
      });
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo dejar de seguir al usuario",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFollowingUsers();
  }, [user]);

  return {
    isFollowing,
    followUser,
    unfollowUser,
    isLoading
  };
};
