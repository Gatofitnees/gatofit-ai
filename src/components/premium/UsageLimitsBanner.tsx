
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
  const isNearLimit = usageInfo.current >= usageInfo.limit * 0.8;
  const isAtLimit = usageInfo.current >= usageInfo.limit;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      isAtLimit 
        ? 'bg-red-100 text-red-700 border border-red-200' 
        : isNearLimit 
        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
        : 'bg-gray-100 text-gray-600 border border-gray-200'
    } ${className}`}>
      <Crown className={`h-3 w-3 ${
        isAtLimit 
          ? 'text-red-500' 
          : isNearLimit 
          ? 'text-yellow-500'
          : 'text-gray-500'
      }`} />
      <span className="font-medium">
        {usageInfo.current}/{usageInfo.limit}
      </span>
    </div>
  );
};
