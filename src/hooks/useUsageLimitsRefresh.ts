
import { useCallback } from 'react';
import { useUsageLimits } from './useUsageLimits';

export const useUsageLimitsRefresh = () => {
  const { fetchUsage } = useUsageLimits();

  const refreshUsageLimits = useCallback(async () => {
    console.log('🔄 [USAGE LIMITS REFRESH] Forcing refresh');
    await fetchUsage();
  }, [fetchUsage]);

  return {
    refreshUsageLimits
  };
};
