
import React from "react";
import { cn } from "@/lib/utils";

interface MacroRingProps {
  value: number;
  target: number;
  icon?: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
  unit?: string;
  showValues?: boolean;
}

const MacroRing: React.FC<MacroRingProps> = ({
  value,
  target,
  icon,
  color = "primary",
  size = "md",
  className,
  animated = true,
  unit = "g",
  showValues = false,
}) => {
  const progress = Math.min(100, Math.max(0, (value / target) * 100));
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };
  
  const colorClasses = {
    primary: "text-primary",
    protein: "text-blue-400", 
    carbs: "text-green-400",
    fat: "text-yellow-400"
  };
  
  const strokeWidth = size === 'sm' ? 4 : 5;
  const radius = size === 'sm' ? 26 : (size === 'md' ? 34 : 42);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Fondo del anillo */}
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth={strokeWidth}
          stroke="rgba(255, 255, 255, 0.1)"
          fill="none"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          className={cn(
            colorClasses[color as keyof typeof colorClasses] || colorClasses.primary,
            animated && "transition-all duration-1000 ease-out"
          )}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      
      {/* Contenido del centro - solo icono */}
      <div className="absolute inset-0 flex items-center justify-center">
        {icon && (
          <div className="flex items-center justify-center">
            {icon}
          </div>
        )}
        {showValues && (
          <div className="text-xs font-medium leading-tight">
            {value}<span className="text-xs text-muted-foreground">/{target}{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MacroRing;
