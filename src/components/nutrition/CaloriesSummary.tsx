
import React from 'react';
import ProgressRing from '../ProgressRing';

interface Macros {
  calories: { current: number; target: number; unit: string; };
  protein: { current: number; target: number; };
  carbs: { current: number; target: number; };
  fats: { current: number; target: number; };
}

interface CaloriesSummaryProps {
  macros: Macros;
  calorieProgress: number;
}

export const CaloriesSummary: React.FC<CaloriesSummaryProps> = ({ macros, calorieProgress }) => {
  return (
    <div className="flex items-center justify-center mb-8 animate-fade-in">
      <div className="relative flex items-center justify-center">
        <ProgressRing progress={calorieProgress} size={130} strokeWidth={8} className="text-primary" />
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{macros.calories.current}</span>
          <span className="text-xs text-muted-foreground">/ {macros.calories.target}</span>
          <span className="text-xs mt-1">kcal</span>
        </div>
      </div>
    </div>
  );
};
