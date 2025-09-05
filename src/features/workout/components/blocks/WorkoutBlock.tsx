import React from "react";
import { WorkoutBlock as WorkoutBlockType } from "../../types/blocks";
import { RoutineExercise } from "../../types";
import { BlockHeader } from "./BlockHeader";
import ExerciseItem from "../ExerciseItem";

interface WorkoutBlockProps {
  block: WorkoutBlockType;
  routineExercises: RoutineExercise[];
  onAddSet: (exerciseIndex: number) => void;
  onSetUpdate: (exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  onExerciseOptions: (exerciseIndex: number) => void;
  onAddExercises: (blockId: string) => void;
  onReorderClick: (blockId: string) => void;
}

export const WorkoutBlock: React.FC<WorkoutBlockProps> = ({
  block,
  routineExercises,
  onAddSet,
  onSetUpdate,
  onExerciseOptions,
  onAddExercises,
  onReorderClick,
}) => {
  // Get exercises for this block
  const blockExercises = block.exercises
    .map(exerciseIndex => ({
      exercise: routineExercises[exerciseIndex],
      originalIndex: exerciseIndex
    }))
    .filter(item => item.exercise); // Filter out any undefined exercises

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <BlockHeader
        block={block}
        exerciseCount={blockExercises.length}
        onAddExercises={onAddExercises}
        onReorderClick={blockExercises.length > 0 ? () => onReorderClick(block.id) : undefined}
      />
      
      {blockExercises.length > 0 ? (
        <div className="p-3 space-y-3">
          {blockExercises.map(({ exercise, originalIndex }, index) => (
            <ExerciseItem
              key={`${block.id}-${originalIndex}-${index}`}
              exercise={exercise}
              index={originalIndex}
              onAddSet={onAddSet}
              onSetUpdate={onSetUpdate}
              onExerciseOptions={onExerciseOptions}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-muted-foreground text-sm">
          No hay ejercicios en este bloque
        </div>
      )}
    </div>
  );
};