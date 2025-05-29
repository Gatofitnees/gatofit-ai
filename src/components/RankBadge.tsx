
import React from 'react';
import { getRankFromLevel } from '@/utils/rankSystem';

interface RankBadgeProps {
  level: number;
  showIcon?: boolean;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RankBadge: React.FC<RankBadgeProps> = ({ 
  level, 
  showIcon = true, 
  showName = true,
  size = 'md' 
}) => {
  const rank = getRankFromLevel(level);
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
      {showIcon && (
        <span className={iconSizes[size]}>{rank.icon}</span>
      )}
      {showName && (
        <span className={`font-medium ${rank.textColor}`}>
          {rank.name}
        </span>
      )}
    </div>
  );
};

export default RankBadge;
