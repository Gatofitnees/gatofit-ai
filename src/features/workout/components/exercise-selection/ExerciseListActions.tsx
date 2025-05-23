
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExerciseListActionsProps {
  exerciseCount: number;
  onCreateExercise: () => void;
  isActiveWorkout?: boolean;
}

const ExerciseListActions: React.FC<ExerciseListActionsProps> = ({
  exerciseCount,
  onCreateExercise,
  isActiveWorkout
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-muted-foreground">
        {exerciseCount} ejercicios encontrados
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onCreateExercise}
        className="text-xs"
      >
        <Plus size={14} className="mr-1" />
        {isActiveWorkout ? "Crear temporal" : "Crear ejercicio"}
      </Button>
    </div>
  );
};

export default ExerciseListActions;
