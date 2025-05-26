
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
        "relative overflow-hidden px-4 py-3 rounded-lg bg-gray-800/90 border border-gray-700/50",
        "hover:bg-gray-700/90 transition-all duration-300",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent before:translate-x-[-200%] before:transition-transform before:duration-1000",
        "hover:before:translate-x-[200%]",
        "flex items-center justify-center gap-2",
        "shadow-neu-button",
        className
      )}
    >
      <Sparkles className="h-4 w-4 text-gray-400" />
      <span className="relative z-10 text-sm font-medium text-white galactic-glow-text">
        {children}
      </span>
    </button>
  );
};
