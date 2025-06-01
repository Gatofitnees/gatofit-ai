
import React, { useState, useRef } from 'react';
import { Flame, Zap, Wheat, Droplet, Trash2, Loader2 } from 'lucide-react';
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
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
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
  className,
  isLoading = false,
  error,
  onRetry
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
  const intelligentTruncate = (text: string, maxLength: number = 18) => {
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
    if (isLoading) return;
    startX.current = e.touches[0].clientX;
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive || isLoading) return;
    
    currentX.current = e.touches[0].clientX;
    const distance = startX.current - currentX.current;
    
    if (distance > 0) {
      setSwipeDistance(Math.min(distance, 80));
    }
  };

  const handleTouchEnd = () => {
    if (isLoading) return;
    if (swipeDistance > 60 && onDelete) {
      onDelete();
    } else {
      setSwipeDistance(0);
    }
    setIsSwipeActive(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLoading) return;
    startX.current = e.clientX;
    setIsSwipeActive(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwipeActive || isLoading) return;
    
    currentX.current = e.clientX;
    const distance = startX.current - currentX.current;
    
    if (distance > 0) {
      setSwipeDistance(Math.min(distance, 80));
    }
  };

  const handleMouseUp = () => {
    if (isLoading) return;
    if (swipeDistance > 60 && onDelete) {
      onDelete();
    } else {
      setSwipeDistance(0);
    }
    setIsSwipeActive(false);
  };

  const handleClick = () => {
    if (isLoading) return;
    if (error && onRetry) {
      onRetry();
      return;
    }
    if (swipeDistance === 0 && onClick) {
      onClick();
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div 
        ref={cardRef}
        className={cn(
          "neu-card cursor-pointer hover:bg-secondary/10 transition-all duration-200 relative",
          isLoading && "opacity-75",
          error && "border-red-500/50",
          className
        )}
        style={{ transform: `translateX(-${swipeDistance}px)` }}
        onClick={handleClick}
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

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20 rounded-xl">
            <div className="bg-background/90 rounded-full p-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </div>
        )}

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
          <div className="flex-1 p-3 flex flex-col justify-center">
            {/* Food Name */}
            <h3 className="font-medium text-sm mb-1 leading-tight">
              {error ? 'Hey parece que eso no se come' : (isLoading ? 'Calculando nutrientes...' : intelligentTruncate(name))}
            </h3>
            
            {/* Status message or Calories */}
            <div className="flex items-center gap-2 mb-1">
              {error ? (
                <span className="text-sm text-red-500">Inténtalo nuevamente</span>
              ) : isLoading ? (
                <span className="text-sm text-muted-foreground">Espera unos segundos...</span>
              ) : (
                <>
                  <Flame className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  <span className="text-lg font-bold">{calories} kcal</span>
                </>
              )}
            </div>
            
            {/* Macronutrients - Only show if not loading and no error */}
            {!isLoading && !error && (
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-blue-400 flex-shrink-0" />
                  <span className="font-medium">{protein}g</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Wheat className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="font-medium">{carbs}g</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Droplet className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                  <span className="font-medium">{fat}g</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Button */}
      {swipeDistance > 20 && !isLoading && (
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
