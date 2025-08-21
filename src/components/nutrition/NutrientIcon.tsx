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
          icon: 'ss-flame',
          color: '#f97316', // orange-500
          bgColor: 'bg-muted/20',
          unit: 'kcal'
        };
      case 'protein':
        return {
          icon: 'sr-drumstick',
          color: '#dd6969', // matching MacroProgress
          bgColor: 'bg-muted/20',
          unit: 'g'
        };
      case 'carbs':
        return {
          icon: 'sr-wheat',
          color: '#EB9F6D', // matching MacroProgress  
          bgColor: 'bg-muted/20',
          unit: 'g'
        };
      case 'fat':
        return {
          icon: 'sr-avocado',
          color: '#6C95DC', // matching MacroProgress
          bgColor: 'bg-muted/20',
          unit: 'g'
        };
      default:
        return {
          icon: 'sr-circle',
          color: '#6b7280', // gray-500
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
          style={{ color: config.color, transform: 'translateY(1px)' }}
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