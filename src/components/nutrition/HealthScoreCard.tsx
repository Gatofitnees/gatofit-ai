
import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthScoreCardProps {
  healthScore: number;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ healthScore }) => {
  const getHealthScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-400';
    if (score >= 4) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="neu-card p-4 mb-4">
      <div className="flex items-center gap-3">
        <Heart className="h-5 w-5 text-red-400" />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Puntaje de salud</span>
            <span className="text-sm font-bold">{healthScore}/10</span>
          </div>
          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                getHealthScoreColor(healthScore)
              )}
              style={{ width: `${(healthScore / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
