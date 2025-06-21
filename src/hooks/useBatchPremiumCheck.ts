
import { useState, useEffect, useCallback } from 'react';
import { useSubscriptionCache } from '@/hooks/subscription/useSubscriptionCache';

interface PremiumStatusMap {
  [userId: string]: boolean;
}

export const useBatchPremiumCheck = (userIds: string[]) => {
  const [premiumStatuses, setPremiumStatuses] = useState<PremiumStatusMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const { checkUserPremiumStatus } = useSubscriptionCache();

  const checkPremiumStatuses = useCallback(async () => {
    if (userIds.length === 0) return;

    setIsLoading(true);
    const statusMap: PremiumStatusMap = {};

    try {
      // Verificar en paralelo todos los usuarios
      const promises = userIds.map(async (userId) => {
        try {
          const isPremium = await checkUserPremiumStatus(userId);
          statusMap[userId] = isPremium;
        } catch (error) {
          console.error(`Error checking premium status for user ${userId}:`, error);
          statusMap[userId] = false;
        }
      });

      await Promise.all(promises);
      setPremiumStatuses(statusMap);
    } catch (error) {
      console.error('Error in batch premium check:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userIds, checkUserPremiumStatus]);

  useEffect(() => {
    checkPremiumStatuses();
  }, [checkPremiumStatuses]);

  return {
    premiumStatuses,
    isLoading,
    refetch: checkPremiumStatuses
  };
};
