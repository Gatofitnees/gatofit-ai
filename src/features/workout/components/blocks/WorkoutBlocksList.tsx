import React from "react";
import WorkoutBlock from "./WorkoutBlock";
import AddBlockButton from "./AddBlockButton";
import { WorkoutBlock as WorkoutBlockType } from "../../types";

interface WorkoutBlocksListProps {
  blocks: WorkoutBlockType[];
  onAddSet: (blockIndex: number, exerciseIndex: number) => void;
  onSetUpdate: (blockIndex: number, exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  onExerciseOptions: (blockIndex: number, exerciseIndex: number) => void;
  onAddExercises: (blockIndex: number) => void;
  onReorderClick: (blockIndex: number) => void;
  onAddBlock: () => void;
}

const WorkoutBlocksList: React.FC<WorkoutBlocksListProps> = ({
  blocks,
  onAddSet,
  onSetUpdate,
  onExerciseOptions,
  onAddExercises,
  onReorderClick,
  onAddBlock,
}) => {
  return (
    <div className="space-y-6">
      {blocks.length > 0 ? (
        <>
          {blocks.map((block, blockIndex) => (
            <WorkoutBlock
              key={block.id}
              block={block}
              blockIndex={blockIndex}
              onAddSet={onAddSet}
              onSetUpdate={onSetUpdate}
              onExerciseOptions={onExerciseOptions}
              onAddExercises={onAddExercises}
              onReorderClick={onReorderClick}
            />
          ))}
          {/* Add another block button */}
          <AddBlockButton onClick={onAddBlock} />
        </>
      ) : (
        <>
          <div className="text-center py-6 text-muted-foreground">
            No hay bloques creados
          </div>
          <AddBlockButton onClick={onAddBlock} />
        </>
      )}
    </div>
  );
};

export default WorkoutBlocksList;