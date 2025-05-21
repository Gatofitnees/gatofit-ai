
import React from "react";
import Button from "@/components/Button";
import { Plus } from "lucide-react";

interface ExerciseListActionsProps {
  exerciseCount: number;
  onCreateExercise: () => void;
}

const ExerciseListActions: React.FC<ExerciseListActionsProps> = ({
  exerciseCount,
  onCreateExercise,
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
        type="button"
      >
        Crear Ejercicio
      </Button>
    </div>
  );
};

export default ExerciseListActions;
