
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
          limit: 4,
          label: 'rutinas creadas',
          period: 'total'
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
          limit: 5,
          label: 'mensajes de IA',
          period: 'esta semana'
        };
    }
  };

  const usageInfo = getUsageInfo();
  const percentage = (usageInfo.current / usageInfo.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  if (percentage < 50) return null;

  return (
    <div className={`neu-card p-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          isAtLimit ? 'bg-red-500/20' : isNearLimit ? 'bg-yellow-500/20' : 'bg-blue-500/20'
        }`}>
          {isAtLimit ? (
            <AlertCircle className={`h-4 w-4 text-red-500`} />
          ) : (
            <Crown className={`h-4 w-4 ${isNearLimit ? 'text-yellow-500' : 'text-blue-500'}`} />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">
              {usageInfo.current}/{usageInfo.limit} {usageInfo.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {usageInfo.period}
            </span>
          </div>
          
          <div className="w-full bg-secondary/30 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      {isNearLimit && (
        <p className="text-xs text-muted-foreground mt-2">
          {isAtLimit 
            ? 'Has alcanzado tu límite. Actualiza a Premium para continuar.'
            : 'Te estás acercando a tu límite. Considera actualizar a Premium.'
          }
        </p>
      )}
    </div>
  );
};
