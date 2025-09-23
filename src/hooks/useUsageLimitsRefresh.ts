
import { useCallback } from 'react';
import { useOptimizedUsageLimits } from '@/hooks/useOptimizedUsageLimits';

export const useUsageLimitsRefresh = () => {
  const { fetchUsage } = useOptimizedUsageLimits();

  const refreshUsageLimits = useCallback(async () => {
// Remove debug logs to improve performance
console.log('🔄 [USAGE LIMITS REFRESH] Forcing refresh');
    await fetchUsage();
  }, [fetchUsage]);

  return {
    refreshUsageLimits
  };
};
