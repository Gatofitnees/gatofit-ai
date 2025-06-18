
import React from 'react';
import { Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

interface UsageLimitsBannerProps {
  type: 'routines' | 'nutrition' | 'ai_chat';
  className?: string;
}

export const UsageLimitsBanner: React.FC<UsageLimitsBannerProps> = ({
  type,
  className = ''
}) => {
  const { isPremium } = useSubscription();
  const { usage } = useUsageLimits();

  if (isPremium || !usage) return null;

  const getUsageInfo = () => {
    switch (type) {
      case 'routines':
        return {
          current: usage.routines_created,
          limit: 5
        };
      case 'nutrition':
        return {
          current: usage.nutrition_photos_used,
          limit: 10
        };
      case 'ai_chat':
        return {
          current: usage.ai_chat_messages_used,
          limit: 3
        };
    }
  };

  const usageInfo = getUsageInfo();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Crown className="h-4 w-4 text-yellow-500" />
      <span className="text-sm text-muted-foreground">
        {usageInfo.current}/{usageInfo.limit}
      </span>
    </div>
  );
};
