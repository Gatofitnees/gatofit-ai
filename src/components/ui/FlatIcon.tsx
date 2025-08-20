import React from 'react';
import { cn } from '@/lib/utils';

interface FlatIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const FlatIcon: React.FC<FlatIconProps> = ({ 
  name, 
  className,
  size = 16 
}) => {
  return (
    <i 
      className={cn(`fi fi-${name}`, className)}
      style={{ fontSize: `${size}px` }}
    />
  );
};