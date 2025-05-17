
import React from "react";
import { Plus } from "lucide-react";
import Button from "@/components/Button";

interface ExerciseListStatsProps {
  exerciseCount: number;
  onCreateExercise: () => void;
}

const ExerciseListStats: React.FC<ExerciseListStatsProps> = ({
  exerciseCount,
  onCreateExercise
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <span className="text-sm text-muted-foreground">
        {exerciseCount} ejercicios encontrados
      </span>
      <Button 
        variant="secondary"
        size="sm"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={onCreateExercise}
      >
        Crear Ejercicio
      </Button>
    </div>
  );
};

export default ExerciseListStats;
