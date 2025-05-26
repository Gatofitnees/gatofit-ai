
import React, { useState, useRef } from 'react';
import { Flame, Zap, Wheat, Droplet, Trash2 } from 'lucide-react';
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
  onDelete?: () => void;
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
  onDelete,
  className
}) => {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para truncado inteligente del texto
  const intelligentTruncate = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    
    // Buscar el último espacio antes del límite
    const truncateIndex = text.lastIndexOf(' ', maxLength);
    
    // Si no hay espacios, cortar directamente
    if (truncateIndex === -1) {
      return text.substring(0, maxLength) + '...';
    }
    
    return text.substring(0, truncateIndex) + '...';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive) return;
    
    currentX.current = e.touches[0].clientX;
    const distance = startX.current - currentX.current;
    
    if (distance > 0) {
      set = Math.min(distance, 80);
    }
  };

  const handleTouchEnd = () => {
    if (swipeDistance > 60 && onDelete) {
      onDelete();
    } else {
      setSwipeDistance(0);
    }
    setIsSwipeActive(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsSwipeActive(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwipeActive) return;
    
    currentX.current = e.clientX;
    const distance = startX.current - currentX.current;
    
    if (distance > 0) {
      setSwipeDistance(Math.min(distance, 80));
    }
  };

  const handleMouseUp = () => {
    if (swipeDistance > 60 && onDelete) {
      onDelete();
    } else {
      setSwipeDistance(0);
    }
    setIsSwipeActive(false);
  };

  return (
    <div className="relative overflow-hidden">
      <div 
        ref={cardRef}
        className={cn(
          "neu-card cursor-pointer hover:bg-secondary/10 transition-all duration-200 relative",
          className
        )}
        style={{ transform: `translateX(-${swipeDistance}px)` }}
        onClick={swipeDistance === 0 ? onClick : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Time stamp */}
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md z-10">
          {formatTime(loggedAt)}
        </div>

        <div className="flex h-28">
          {/* Food Image - Left Side */}
          <div className="w-28 h-28 flex-shrink-0">
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover rounded-l-xl"
            />
          </div>

          {/* Food Details - Right Side */}
          <div className="flex-1 p-4 pl-3 flex flex-col justify-between">
            {/* Food Name - con truncado inteligente */}
            <h3 className="font-medium text-sm mb-2 leading-tight line-clamp-1">
              {intelligentTruncate(name)}
            </h3>
            
            {/* Calories - Main Line */}
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-orange-400 flex-shrink-0" />
              <span className="text-lg font-bold">{calories} kcal</span>
            </div>
            
            {/* Macronutrients - Rediseñados en horizontal */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col items-center gap-1">
                <Zap className="h-3 w-3 text-blue-400 flex-shrink-0" />
                <span>{protein}g</span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <Wheat className="h-3 w-3 text-green-400 flex-shrink-0" />
                <span>{carbs}g</span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <Droplet className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                <span>{fat}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      {swipeDistance > 20 && (
        <div 
          className="absolute right-0 top-0 h-full flex items-center justify-center bg-red-500 text-white"
          style={{ width: `${Math.min(swipeDistance, 80)}px` }}
        >
          <Trash2 className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};
