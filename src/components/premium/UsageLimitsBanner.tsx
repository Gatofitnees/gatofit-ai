
import React from 'react';
import { Crown, AlertCircle } from 'lucide-react';
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
          limit: 5,
          label: 'rutinas creadas',
          period: ''
        };
      case 'nutrition':
        return {
          current: usage.nutrition_photos_used,
          limit: 10,
          label: 'fotos de nutrición',
          period: 'esta semana'
        };
      case 'ai_chat':
        return {
          current: usage.ai_chat_messages_used,
          limit: 3,
          label: 'chats',
          period: 'esta semana'
        };
    }
  };

  const usageInfo = getUsageInfo();
  const percentage = (usageInfo.current / usageInfo.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={`flex items-center justify-center py-2 px-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Crown className="h-4 w-4 text-yellow-500" />
        <span>
          {usageInfo.current}/{usageInfo.limit} {usageInfo.label} {usageInfo.period}
        </span>
        {isAtLimit && (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
};
