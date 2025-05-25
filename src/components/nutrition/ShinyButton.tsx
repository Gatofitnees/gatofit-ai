
import React from 'react';
import { cn } from '@/lib/utils';

interface ShinyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  onClick,
  className,
  icon
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden px-4 py-2 rounded-lg border border-white/20 bg-gradient-to-r from-primary/20 to-primary/30 hover:from-primary/30 hover:to-primary/40 transition-all duration-300",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] before:transition-transform before:duration-1000",
        "hover:before:translate-x-[200%]",
        "flex items-center gap-2",
        className
      )}
    >
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10 text-sm font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent animate-pulse">
        {children}
      </span>
    </button>
  );
};
