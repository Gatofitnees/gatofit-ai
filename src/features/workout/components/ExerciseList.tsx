
import React from "react";
import { RoutineExercise } from "../types";
import ExerciseItem from "./ExerciseItem";
import Button from "@/components/Button";

interface ExerciseListProps {
  exercises: RoutineExercise[];
  onAddSet: (index: number) => void;
  onSetUpdate: (exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  onExerciseOptions: (index: number) => void;
  onReorderClick: () => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onAddSet,
  onSetUpdate,
  onExerciseOptions,
  onReorderClick
}) => {
  return (
    <>
      <div className="flex justify-between items-center pt-2">
        <h3 className="text-base font-medium">Ejercicios</h3>
        {exercises.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReorderClick}
          >
            Ordenar
          </Button>
        )}
      </div>
      
      {exercises.length > 0 ? (
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <ExerciseItem
              key={`${exercise.id}-${index}`}
              exercise={exercise}
              index={index}
              onAddSet={onAddSet}
              onSetUpdate={onSetUpdate}
              onExerciseOptions={onExerciseOptions}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No hay ejercicios seleccionados
        </div>
      )}
    </>
  );
};

export default ExerciseList;
