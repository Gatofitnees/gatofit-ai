
import React from "react";
import { Plus } from "lucide-react";
import Button from "@/components/Button";
import { Exercise } from "@/hooks/workout/useExercises";
import ExerciseConfigItem from "@/components/workout/ExerciseConfigItem";

interface RoutineExercisesListProps {
  exercises: Exercise[];
  exerciseConfigs: {
    [exerciseId: number]: {
      sets: number;
      repsMin: number;
      repsMax: number;
      restSeconds: number;
    }
  };
  onAddExercises: () => void;
  onConfigChange: (exerciseId: number, field: string, value: number) => void;
  onViewDetails: (id: number) => void;
}

const RoutineExercisesList: React.FC<RoutineExercisesListProps> = ({
  exercises,
  exerciseConfigs,
  onAddExercises,
  onConfigChange,
  onViewDetails
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Ejercicios</h2>
        <Button 
          variant="primary" 
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={onAddExercises}
        >
          Añadir Ejercicios
        </Button>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay ejercicios añadidos</p>
          <p className="text-sm mt-2">Añade ejercicios a tu rutina</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <ExerciseConfigItem
              key={exercise.id}
              exercise={exercise}
              config={exerciseConfigs[exercise.id] || {
                sets: 3,
                repsMin: 8,
                repsMax: 12,
                restSeconds: 60
              }}
              onConfigChange={onConfigChange}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default RoutineExercisesList;
