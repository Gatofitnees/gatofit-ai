
import React from "react";
import { Plus } from "lucide-react";
import Button from "@/components/Button";

interface ExerciseSelectionActionsProps {
  filteredExercisesCount: number;
  onCreateExercise: () => void;
  selectedCount: number;
  onAddExercises: () => void;
}

const ExerciseSelectionActions: React.FC<ExerciseSelectionActionsProps> = ({
  filteredExercisesCount,
  onCreateExercise,
  selectedCount,
  onAddExercises
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-muted-foreground">
          {filteredExercisesCount} ejercicios encontrados
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

      {/* Selected Exercises Floating Button */}
      {selectedCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
          <Button
            variant="primary"
            className="shadow-neu-float px-6 bg-blue-500 hover:bg-blue-600"
            onClick={onAddExercises}
            type="button"
          >
            Añadir {selectedCount} ejercicios
          </Button>
        </div>
      )}
    </>
  );
};

export default ExerciseSelectionActions;
