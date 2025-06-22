
import React from "react";

interface SessionStatsProps {
  sets: {
    set_number: number;
    weight_kg_used: number | null;
    reps_completed: number | null;
  }[];
  maxWeight: number | null;
  totalReps: number;
}

export const SessionStats: React.FC<SessionStatsProps> = ({
  sets,
  maxWeight,
  totalReps
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Peso máximo:</span>
        <span className="font-medium text-primary">
          {maxWeight ? `${maxWeight} kg` : '-'}
        </span>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Total repeticiones:</span>
        <span className="font-medium text-primary">{totalReps}</span>
      </div>
      
      <div className="mt-4">
        <h5 className="text-sm font-medium mb-2">Series realizadas:</h5>
        <div className="space-y-2">
          {sets.map((set) => (
            <div 
              key={set.set_number}
              className="flex justify-between items-center text-xs p-2 bg-background/30 rounded"
            >
              <span>Serie {set.set_number}</span>
              <span>
                {set.weight_kg_used ? `${set.weight_kg_used} kg` : '-'} × {set.reps_completed || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
