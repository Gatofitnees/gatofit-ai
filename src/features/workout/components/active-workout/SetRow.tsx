
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DecimalInput } from '@/components/ui/decimal-input';
import { NumericInput } from '@/components/ui/numeric-input';

interface SetRowProps {
  setNumber: number;
  weight: string;
  reps: string;
  previousWeight?: number | null;
  previousReps?: number | null;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRemove: () => void;
  showRemove?: boolean;
}

const SetRow: React.FC<SetRowProps> = ({
  setNumber,
  weight,
  reps,
  previousWeight,
  previousReps,
  onWeightChange,
  onRepsChange,
  onRemove,
  showRemove = true
}) => {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10">
      {/* Set number */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
        {setNumber}
      </div>
      
      {/* Previous data display */}
      {(previousWeight || previousReps) && (
        <div className="text-xs text-muted-foreground min-w-[80px]">
          {previousWeight && <div>{previousWeight} kg</div>}
          {previousReps && <div>{previousReps} reps</div>}
        </div>
      )}
      
      {/* Weight input - usando DecimalInput para permitir decimales */}
      <div className="flex-1">
        <DecimalInput
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          placeholder="Peso (kg)"
          className="text-center"
        />
      </div>
      
      {/* Reps input - usando NumericInput para enteros */}
      <div className="flex-1">
        <NumericInput
          value={reps}
          onChange={(e) => onRepsChange(e.target.value)}
          placeholder="Reps"
          className="text-center"
        />
      </div>
      
      {/* Remove button */}
      {showRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SetRow;
