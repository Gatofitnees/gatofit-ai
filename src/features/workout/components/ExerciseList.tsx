
import React from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoutineExercise } from "../types";
import ExerciseSet from "./ExerciseSet";

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
  onReorderClick,
}) => {
  const handleExerciseNameClick = (exerciseId: number) => {
    window.location.href = `/exercises/${exerciseId}`;
  };

  return (
    <div className="space-y-4">
      {exercises.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-medium">
              Ejercicios ({exercises.length})
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onReorderClick}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Reordenar
            </Button>
          </div>
          
          {exercises.map((exercise, index) => (
            <ExerciseSet
              key={exercise.id}
              id={exercise.id}
              name={exercise.name}
              muscleGroup={exercise.muscle_group_main}
              equipment={exercise.equipment_required}
              sets={exercise.sets}
              onAddSet={() => onAddSet(index)}
              onSetUpdate={(setIndex, field, value) => onSetUpdate(index, setIndex, field, value)}
              onOptionsClick={() => onExerciseOptions(index)}
              onExerciseNameClick={handleExerciseNameClick}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ExerciseList;
