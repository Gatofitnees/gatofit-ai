
import React from 'react';
import { Card, CardBody } from '@/components/Card';
import { Flame, Zap, Wheat, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodPreviewCardProps {
  imageUrl: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
  onClick?: () => void;
  className?: string;
}

export const FoodPreviewCard: React.FC<FoodPreviewCardProps> = ({
  imageUrl,
  name,
  calories,
  protein,
  carbs,
  fat,
  loggedAt,
  onClick,
  className
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={cn(
        "neu-card p-4 cursor-pointer hover:bg-secondary/10 transition-all duration-200 relative",
        className
      )}
      onClick={onClick}
    >
      {/* Time stamp */}
      <div className="absolute top-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md">
        {formatTime(loggedAt)}
      </div>

      <div className="flex items-start gap-4">
        {/* Food Image */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary/20">
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Food Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm mb-2 truncate">{name}</h3>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" />
              <span>{calories} cal</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-400" />
              <span>{protein}g</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Wheat className="h-3 w-3 text-green-400" />
              <span>{carbs}g</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Droplet className="h-3 w-3 text-yellow-400" />
              <span>{fat}g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
