
import React from 'react';
import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-base'
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5'
  };

  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full
      bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium
      ${sizeClasses[size]} ${className}
    `}>
      <Crown className={iconSizes[size]} />
      <span>Premium</span>
    </div>
  );
};
