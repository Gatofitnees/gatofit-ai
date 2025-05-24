
import React from "react";
import { NumericInput } from "@/components/ui/numeric-input";

interface WorkoutSet {
  set_number: number;
  weight: number | null;
  reps: number | null;
  notes: string;
  previous_weight: number | null;
  previous_reps: number | null;
}

interface SetRowProps {
  set: WorkoutSet;
  exerciseIndex: number;
  setIndex: number;
  onInputChange: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void;
}

export const SetRow: React.FC<SetRowProps> = ({ 
  set, 
  exerciseIndex, 
  setIndex, 
  onInputChange 
}) => {
  return (
    <div className="bg-background/50 rounded-lg border border-white/5 p-2">
      <div className="grid grid-cols-4 gap-2">
        {/* Serie column */}
        <div className="flex items-center">
          <div className="h-6 w-6 rounded-full bg-primary/30 flex items-center justify-center text-sm">
            {set.set_number}
          </div>
        </div>
        
        {/* Anterior column */}
        <div className="text-xs text-muted-foreground flex items-center">
          {set.previous_weight !== null && set.previous_reps !== null 
            ? `${set.previous_weight}kg × ${set.previous_reps}` 
            : '-'}
        </div>
        
        {/* Peso column */}
        <div>
          <NumericInput
            className="w-full h-8 text-sm"
            value={set.weight !== null ? set.weight : ''}
            onChange={(e) => onInputChange(exerciseIndex, setIndex, 'weight', e.target.value)}
            placeholder="kg"
          />
        </div>
        
        {/* Reps column */}
        <div>
          <NumericInput
            className="w-full h-8 text-sm"
            value={set.reps !== null ? set.reps : ''}
            onChange={(e) => onInputChange(exerciseIndex, setIndex, 'reps', e.target.value)}
            placeholder="reps"
          />
        </div>
      </div>
    </div>
  );
};
