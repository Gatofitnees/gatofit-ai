
import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalacticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const GalacticButton: React.FC<GalacticButtonProps> = ({
  children,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden px-4 py-3 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/20 to-purple-500/20 hover:from-primary/30 hover:to-purple-500/30 transition-all duration-300",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent before:translate-x-[-200%] before:transition-transform before:duration-1000",
        "hover:before:translate-x-[200%]",
        "flex items-center justify-center gap-2",
        "animate-galaxy-glow",
        className
      )}
    >
      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
      <span className="relative z-10 text-sm font-medium bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent animate-galaxy-pulse">
        {children}
      </span>
    </button>
  );
};
