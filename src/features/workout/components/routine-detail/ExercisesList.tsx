
import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import ExerciseCard from "./ExerciseCard";

interface ExerciseDetail {
  id: number;
  name: string;
  muscle_group_main?: string;
  equipment_required?: string;
  sets: Array<{
    set_number: number;
    reps_min: number;
    reps_max: number;
    rest_seconds: number;
  }>;
}

interface ExercisesListProps {
  exercises: ExerciseDetail[];
}

const ExercisesList: React.FC<ExercisesListProps> = ({ exercises }) => {
  const navigate = useNavigate();

  if (exercises.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Esta rutina no tiene ejercicios</p>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate(`/workout/create`)}
          type="button"
        >
          Crear nueva rutina
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          id={exercise.id}
          name={exercise.name}
          muscleGroup={exercise.muscle_group_main}
          equipment={exercise.equipment_required}
          sets={exercise.sets}
        />
      ))}
    </div>
  );
};

export default ExercisesList;
