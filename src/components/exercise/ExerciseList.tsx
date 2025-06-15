
import React from "react";
import ExerciseItem from "./ExerciseItem";
import Button from "@/components/Button";
import { Loader2 } from "lucide-react";

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
  previouslySelectedIds?: number[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  selectedExercises, 
  onSelectExercise,
  onViewDetails,
  loading,
  previouslySelectedIds = [],
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  if (loading && exercises.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
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
      ) : !loading ? (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron ejercicios
        </div>
      ) : null}

      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar más"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;
