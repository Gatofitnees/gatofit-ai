
import React from 'react';
import { Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PremiumAvatar: React.FC<PremiumAvatarProps> = ({
  src,
  alt,
  fallback,
  className = '',
  size = 'md'
}) => {
  const { isPremium } = useSubscription();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const crownSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} ${className} ${isPremium ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback className={isPremium ? 'bg-gradient-to-br from-yellow-50 to-yellow-100' : ''}>
          {fallback}
        </AvatarFallback>
      </Avatar>
      
      {isPremium && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-1 shadow-lg transform rotate-45">
          <Crown className={`${crownSizes[size]} text-white fill-current transform -rotate-45`} />
        </div>
      )}
    </div>
  );
};
