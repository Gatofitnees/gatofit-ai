
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DecimalInput } from '@/components/ui/decimal-input';
import { NumericInput } from '@/components/ui/numeric-input';

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

const SetRow: React.FC<SetRowProps> = ({
  set,
  exerciseIndex,
  setIndex,
  onInputChange
}) => {
  return (
    <div className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-secondary/10">
      {/* Set number */}
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
          {set.set_number}
        </div>
      </div>
      
      {/* Previous data display */}
      <div className="text-xs text-muted-foreground">
        {set.previous_weight && <div>{set.previous_weight} kg</div>}
        {set.previous_reps && <div>{set.previous_reps} reps</div>}
      </div>
      
      {/* Weight input - usando DecimalInput para permitir decimales */}
      <div>
        <DecimalInput
          value={set.weight?.toString() || ''}
          onChange={(e) => onInputChange(exerciseIndex, setIndex, 'weight', e.target.value)}
          placeholder="Peso (kg)"
          className="text-center"
        />
      </div>
      
      {/* Reps input - usando NumericInput para enteros */}
      <div>
        <NumericInput
          value={set.reps?.toString() || ''}
          onChange={(e) => onInputChange(exerciseIndex, setIndex, 'reps', e.target.value)}
          placeholder="Reps"
          className="text-center"
        />
      </div>
    </div>
  );
};

export default SetRow;
