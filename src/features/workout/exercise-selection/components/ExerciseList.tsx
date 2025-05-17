
import React from "react";
import ExerciseCard from "./ExerciseCard";
import { Exercise } from "../types";

interface ExerciseListProps {
  exercises: Exercise[];
  selectedExercises: number[];
  loading: boolean;
  onExerciseSelect: (id: number) => void;
  onExerciseDetails: (id: number) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  selectedExercises,
  loading,
  onExerciseSelect,
  onExerciseDetails
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse text-primary">Cargando ejercicios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exercises.map(exercise => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isSelected={selectedExercises.includes(exercise.id)}
          onToggleSelect={onExerciseSelect}
          onViewDetails={onExerciseDetails}
        />
      ))}
    </div>
  );
};

export default ExerciseList;
