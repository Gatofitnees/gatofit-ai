
import React from "react";
import { Card, CardBody } from "@/components/Card";
import ExerciseListItem from "@/components/workout/ExerciseListItem";
import { Exercise } from "@/hooks/workout/useExercises";

interface ExercisesListProps {
  exercises: Exercise[];
  selectedExercises: number[];
  onToggleSelect: (id: number) => void;
  onViewDetails: (id: number) => void;
  isLoading: boolean;
}

const ExercisesList: React.FC<ExercisesListProps> = ({
  exercises,
  selectedExercises,
  onToggleSelect,
  onViewDetails,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Cargando ejercicios...</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No se encontraron ejercicios</p>
        <p className="text-sm mt-2">Intenta con otra búsqueda o añade uno nuevo</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exercises.map(exercise => (
        <Card key={exercise.id} className="hover:scale-[1.01] transition-transform duration-300">
          <CardBody>
            <ExerciseListItem
              exercise={exercise}
              isSelected={selectedExercises.includes(exercise.id)}
              onToggleSelect={onToggleSelect}
              onViewDetails={onViewDetails}
            />
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default ExercisesList;
