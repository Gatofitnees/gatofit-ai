
import React from "react";
import { Card, CardBody } from "@/components/Card";
import ExerciseSet from "./ExerciseSet";

export interface ExerciseSet {
  id: number;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface WorkoutExercise {
  id: number;
  exerciseId: number;
  name: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  order: number;
  currentSet: number;
  exerciseSets: ExerciseSet[];
}

interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise;
  isActive: boolean;
  onSetComplete: (setIndex: number) => void;
  onRepsChange: (setIndex: number, value: string) => void;
  onWeightChange: (setIndex: number, value: string) => void;
}

const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({
  exercise,
  isActive,
  onSetComplete,
  onRepsChange,
  onWeightChange
}) => {
  return (
    <Card 
      className={isActive ? "border-primary" : ""}
    >
      <CardBody>
        <div className="mb-4">
          <h3 className="font-medium">{exercise.order}. {exercise.name}</h3>
          <p className="text-xs text-muted-foreground">
            {exercise.sets} series • {exercise.repsMin}-{exercise.repsMax} repeticiones
          </p>
        </div>
        
        <div className="space-y-3">
          {exercise.exerciseSets.map((set, setIndex) => (
            <ExerciseSet
              key={set.id}
              setNumber={set.setNumber}
              totalSets={exercise.sets}
              weight={set.weight}
              reps={set.reps}
              completed={set.completed}
              isActive={isActive && set.setNumber === exercise.currentSet}
              onWeightChange={(value) => onWeightChange(setIndex, value)}
              onRepsChange={(value) => onRepsChange(setIndex, value)}
              onComplete={() => onSetComplete(setIndex)}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default WorkoutExerciseCard;
