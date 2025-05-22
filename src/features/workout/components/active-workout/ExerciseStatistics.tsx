
import React from "react";
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface PreviousData {
  weight: number | null;
  reps: number | null;
}

interface ExerciseStatisticsProps {
  exerciseName: string;
  showStatsDialog: boolean;
  onCloseDialog: () => void;
  previousData: PreviousData[];
}

export const ExerciseStatistics: React.FC<ExerciseStatisticsProps> = ({ 
  exerciseName,
  showStatsDialog,
  onCloseDialog,
  previousData
}) => {
  // Find max weight and reps from previous data
  const maxWeight = previousData?.reduce((max, current) => {
    if (!current || current.weight === null) return max;
    if (max === null) return current.weight;
    return Math.max(max, current.weight);
  }, null as number | null);

  const maxReps = previousData?.reduce((max, current) => {
    if (!current || current.reps === null) return max;
    if (max === null) return current.reps;
    return Math.max(max, current.reps);
  }, null as number | null);

  return (
    <Dialog open={showStatsDialog} onOpenChange={onCloseDialog}>
      <DialogContent className="bg-background border border-white/5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Estadísticas: {exerciseName}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-secondary/20 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Mejores marcas</h4>
            <p className="text-sm mb-2">
              <span className="font-medium">Peso máximo:</span> 
              <span className="ml-2 text-primary">
                {maxWeight || '-'}
              </span> kg
            </p>
            <p className="text-sm">
              <span className="font-medium">Repeticiones máximas:</span> 
              <span className="ml-2 text-primary">
                {maxReps || '-'}
              </span>
            </p>
          </div>
          
          <h4 className="font-medium mb-2">Historial reciente</h4>
          <p className="text-sm text-muted-foreground">
            No hay suficientes datos para mostrar el historial.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
