
import React from 'react';
import { Flame } from 'lucide-react';

interface CaloriesDisplayProps {
  calories: number;
}

export const CaloriesDisplay: React.FC<CaloriesDisplayProps> = ({ calories }) => {
  return (
    <div className="neu-card p-6 mb-4 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Flame className="h-8 w-8 text-orange-400" />
        <span className="text-3xl font-bold">{calories}</span>
        <span className="text-lg text-muted-foreground">kcal</span>
      </div>
      <p className="text-sm text-muted-foreground">Calorías totales</p>
    </div>
  );
};
