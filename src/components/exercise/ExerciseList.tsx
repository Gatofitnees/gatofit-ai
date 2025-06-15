

import React from "react";
import ExerciseItem from "./ExerciseItem";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
  image_url?: string;
  thumbnail_url?: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
  selectedExercises: number[];
  onSelectExercise: (id: number) => void;
  onViewDetails: (id: number) => void;
  loading: boolean;
  previouslySelectedIds?: number[]; // Add this prop to mark previously selected exercises
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  selectedExercises, 
  onSelectExercise,
  onViewDetails,
  loading,
  previouslySelectedIds = []
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exercises && exercises.length > 0 ? (
        exercises.map(exercise => {
          // Check if this exercise is already in the routine
          const isAlreadySelected = previouslySelectedIds.includes(exercise.id);
          
          return (
            <ExerciseItem 
              key={exercise.id}
              exercise={exercise}
              isSelected={selectedExercises.includes(exercise.id)}
              onSelect={onSelectExercise}
              onViewDetails={onViewDetails}
              isAlreadyInRoutine={isAlreadySelected} // Pass this flag to the ExerciseItem
            />
          );
        })
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron ejercicios
        </div>
      )}
    </div>
  );
};

export default ExerciseList;
