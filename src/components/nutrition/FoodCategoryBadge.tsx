import React from 'react';
import { FlatIcon } from '@/components/ui/FlatIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FoodCategoryBadgeProps {
  category: string;
  subcategory?: string;
  icon?: string;
  color?: string;
  className?: string;
}

const FoodCategoryBadge: React.FC<FoodCategoryBadgeProps> = ({ 
  category, 
  subcategory, 
  icon,
  color,
  className 
}) => {
  const getColorClass = (colorStr?: string) => {
    if (!colorStr) return 'text-gray-500';
    return colorStr;
  };

  return (
    <Badge 
      variant="secondary" 
      className={cn("flex items-center gap-1 text-xs", className)}
    >
      {icon && (
        <FlatIcon 
          name={icon} 
          size={10} 
          className={getColorClass(color)} 
        />
      )}
      <span className="font-medium">{category}</span>
      {subcategory && (
        <>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{subcategory}</span>
        </>
      )}
    </Badge>
  );
};

export default FoodCategoryBadge;