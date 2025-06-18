
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionCache {
  [userId: string]: {
    isPremium: boolean;
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const subscriptionCache: SubscriptionCache = {};

export const useSubscriptionCache = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getCachedPremiumStatus = useCallback((userId: string): boolean | null => {
    const cached = subscriptionCache[userId];
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      delete subscriptionCache[userId];
      return null;
    }
    
    return cached.isPremium;
  }, []);

  const setCachedPremiumStatus = useCallback((userId: string, isPremium: boolean) => {
    subscriptionCache[userId] = {
      isPremium,
      timestamp: Date.now()
    };
  }, []);

  const checkUserPremiumStatus = useCallback(async (userId: string): Promise<boolean> => {
    // Verificar cache primero
    const cached = getCachedPremiumStatus(userId);
    if (cached !== null) {
      return cached;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status, plan_type')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking premium status:', error);
        setCachedPremiumStatus(userId, false);
        return false;
      }
      
      const isPremium = data?.status === 'active' && 
        (data?.plan_type === 'monthly' || data?.plan_type === 'yearly');
      
      setCachedPremiumStatus(userId, isPremium);
      return isPremium;
    } catch (error) {
      console.error('Error checking user premium status:', error);
      setCachedPremiumStatus(userId, false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getCachedPremiumStatus, setCachedPremiumStatus]);

  const clearCache = useCallback(() => {
    Object.keys(subscriptionCache).forEach(key => {
      delete subscriptionCache[key];
    });
  }, []);

  return {
    checkUserPremiumStatus,
    isLoading,
    clearCache
  };
};
