
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionCache {
  [userId: string]: {
    isPremium: boolean;
    isAsesorado: boolean;
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const subscriptionCache: SubscriptionCache = {};

export const useSubscriptionCache = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getCachedStatus = useCallback((userId: string): { isPremium: boolean; isAsesorado: boolean } | null => {
    const cached = subscriptionCache[userId];
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      delete subscriptionCache[userId];
      return null;
    }
    
    return { isPremium: cached.isPremium, isAsesorado: cached.isAsesorado };
  }, []);

  const setCachedStatus = useCallback((userId: string, isPremium: boolean, isAsesorado: boolean) => {
    subscriptionCache[userId] = {
      isPremium,
      isAsesorado,
      timestamp: Date.now()
    };
  }, []);

  const checkUserStatus = useCallback(async (userId: string): Promise<{ isPremium: boolean; isAsesorado: boolean }> => {
    // Verificar cache primero
    const cached = getCachedStatus(userId);
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
        console.error('Error checking user status:', error);
        setCachedStatus(userId, false, false);
        return { isPremium: false, isAsesorado: false };
      }
      
      const isAsesorado = data?.status === 'active' && data?.plan_type === 'asesorados';
      const isPremium = data?.status === 'active' && 
        (data?.plan_type === 'monthly' || data?.plan_type === 'yearly');
      
      setCachedStatus(userId, isPremium, isAsesorado);
      return { isPremium, isAsesorado };
    } catch (error) {
      console.error('Error checking user status:', error);
      setCachedStatus(userId, false, false);
      return { isPremium: false, isAsesorado: false };
    } finally {
      setIsLoading(false);
    }
  }, [getCachedStatus, setCachedStatus]);

  // Mantener compatibilidad con código existente
  const checkUserPremiumStatus = useCallback(async (userId: string): Promise<boolean> => {
    const { isPremium } = await checkUserStatus(userId);
    return isPremium;
  }, [checkUserStatus]);

  const clearCache = useCallback(() => {
    Object.keys(subscriptionCache).forEach(key => {
      delete subscriptionCache[key];
    });
  }, []);

  return {
    checkUserPremiumStatus,
    checkUserStatus,
    isLoading,
    clearCache
  };
};
