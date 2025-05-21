
import React from "react";
import ExerciseCard from "./ExerciseCard";

interface ExerciseSet {
  set_number: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_between_sets_seconds: number;
  muscle_group_main?: string;
  equipment_required?: string;
}

interface ExercisesListProps {
  exercises: Exercise[];
}

const ExercisesList: React.FC<ExercisesListProps> = ({ exercises }) => {
  return (
    <div className="space-y-4">
      {exercises.map((exercise) => {
        // Create formatted sets data for the ExerciseCard
        const formattedSets: ExerciseSet[] = Array.from(
          { length: exercise.sets || 0 },
          (_, i) => ({
            set_number: i + 1,
            reps_min: exercise.reps_min || 0,
            reps_max: exercise.reps_max || 0,
            rest_seconds: exercise.rest_between_sets_seconds || 60,
          })
        );

        return (
          <ExerciseCard
            key={exercise.id}
            id={exercise.id}
            name={exercise.name}
            muscleGroup={exercise.muscle_group_main}
            equipment={exercise.equipment_required}
            sets={formattedSets}
          />
        );
      })}
      
      {exercises.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay ejercicios en esta rutina.
        </div>
      )}
    </div>
  );
};

export default ExercisesList;
