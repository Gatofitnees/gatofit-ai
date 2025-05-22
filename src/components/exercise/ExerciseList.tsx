
import React from "react";
import ExerciseItem from "./ExerciseItem";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
  selectedExercises: number[];
  onSelectExercise: (id: number) => void;
  onViewDetails: (id: number) => void;
  loading: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  selectedExercises, 
  onSelectExercise,
  onViewDetails,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron ejercicios
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exercises.map((exercise) => (
        <ExerciseItem 
          key={exercise.id}
          exercise={exercise}
          isSelected={selectedExercises.includes(exercise.id)}
          onSelect={onSelectExercise}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default ExerciseList;
