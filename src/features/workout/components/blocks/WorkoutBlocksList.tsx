import React from "react";
import { WorkoutBlock as WorkoutBlockType } from "../../types/blocks";
import { RoutineExercise } from "../../types";
import { WorkoutBlock } from "./WorkoutBlock";

interface WorkoutBlocksListProps {
  blocks: WorkoutBlockType[];
  routineExercises: RoutineExercise[];
  onAddSet: (exerciseIndex: number) => void;
  onSetUpdate: (exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  onExerciseOptions: (exerciseIndex: number) => void;
  onAddExercises: (blockId: string) => void;
  onReorderClick: (blockId: string) => void;
}

export const WorkoutBlocksList: React.FC<WorkoutBlocksListProps> = ({
  blocks,
  routineExercises,
  onAddSet,
  onSetUpdate,
  onExerciseOptions,
  onAddExercises,
  onReorderClick,
}) => {
  if (blocks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay bloques creados</p>
        <p className="text-sm">Usa el botón + para añadir un bloque</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block) => (
          <WorkoutBlock
            key={block.id}
            block={block}
            routineExercises={routineExercises}
            onAddSet={onAddSet}
            onSetUpdate={onSetUpdate}
            onExerciseOptions={onExerciseOptions}
            onAddExercises={onAddExercises}
            onReorderClick={onReorderClick}
          />
        ))}
    </div>
  );
};