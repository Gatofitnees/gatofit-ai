
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
  const formatPreviousData = (weight: number | null, reps: number | null) => {
    if (!weight && !reps) return "-";
    if (weight && reps) return `${weight}kg x ${reps}`;
    if (weight) return `${weight}kg`;
    if (reps) return `${reps} reps`;
    return "-";
  };

  return (
    <div className="grid grid-cols-4 gap-2 items-center">
      {/* Set Number */}
      <div className="text-sm font-medium text-center">
        {set.set_number}
      </div>
      
      {/* Previous Data */}
      <div className="text-xs text-muted-foreground text-center">
        {formatPreviousData(set.previous_weight, set.previous_reps)}
      </div>
      
      {/* Weight Input */}
      <div>
        <NumericInput
          value={set.weight?.toString() || ''}
          onChange={(e) => onInputChange(exerciseIndex, setIndex, 'weight', e.target.value)}
          placeholder="kg"
          className="h-8 text-center text-sm"
        />
      </div>
      
      {/* Reps Input */}
      <div>
        <NumericInput
          value={set.reps?.toString() || ''}
          onChange={(e) => onInputChange(exerciseIndex, setIndex, 'reps', e.target.value)}
          placeholder="reps"
          className="h-8 text-center text-sm"
        />
      </div>
    </div>
  );
};
