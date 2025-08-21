import React from 'react';
import { FlatIcon } from '@/components/ui/FlatIcon';
import { cn } from '@/lib/utils';

interface NutrientIconProps {
  type: 'calories' | 'protein' | 'carbs' | 'fat';
  value: number;
  unit?: string;
  className?: string;
}

const NutrientIcon: React.FC<NutrientIconProps> = ({ 
  type, 
  value, 
  unit = 'g',
  className 
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'calories':
        return {
          icon: 'flame',
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          unit: 'kcal'
        };
      case 'protein':
        return {
          icon: 'dumbbell',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          unit: 'g'
        };
      case 'carbs':
        return {
          icon: 'wheat',
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          unit: 'g'
        };
      case 'fat':
        return {
          icon: 'droplet',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          unit: 'g'
        };
      default:
        return {
          icon: 'circle',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          unit: 'g'
        };
    }
  };

  const config = getIconConfig();
  
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center",
        config.bgColor
      )}>
        <FlatIcon 
          name={config.icon} 
          size={12} 
          className={config.color} 
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">
          {Math.round(value)}
        </span>
        <span className="text-xs text-muted-foreground leading-none">
          {unit === 'g' ? config.unit : unit}
        </span>
      </div>
    </div>
  );
};

export default NutrientIcon;