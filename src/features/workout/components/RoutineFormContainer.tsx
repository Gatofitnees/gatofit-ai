import React from "react";
import { Card, CardHeader, CardBody } from "@/components/Card";
import { RoutineExercise, WorkoutBlock } from "../types";
import RoutineForm from "./RoutineForm";
import ExerciseList from "./ExerciseList";
import { WorkoutBlocksList } from "./blocks/WorkoutBlocksList";
import { AddBlockButton } from "./blocks/AddBlockButton";
import { BlockTypeSelector } from "./blocks/BlockTypeSelector";
import { BlockType } from "../types/blocks";

interface RoutineFormContainerProps {
  routineName: string;
  routineType: string;
  routineExercises: RoutineExercise[];
  workoutBlocks: WorkoutBlock[];
  hasBlocks: boolean;
  validationErrors: {
    name: boolean;
    type: boolean;
  };
  showBlockTypeSelector: boolean;
  onNameChange: (name: string) => void;
  onTypeChange: (type: string) => void;
  handleAddSet: (index: number) => void;
  handleSetUpdate: (exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  handleExerciseOptions: (index: number) => void;
  handleReorderClick: () => void;
  handleSelectExercises: (e: React.MouseEvent, blockId?: string) => void;
  handleAddBlock: () => void;
  handleBlockTypeSelect: (type: BlockType) => void;
  handleAddExercisesToBlock: (blockId: string) => void;
  handleReorderBlock: (blockId: string) => void;
  setShowBlockTypeSelector: (show: boolean) => void;
  getUnblockedExercises: () => Array<{ exercise: RoutineExercise; index: number }>;
  isEditing?: boolean;
}

const RoutineFormContainer: React.FC<RoutineFormContainerProps> = ({
  routineName,
  routineType,
  routineExercises,
  workoutBlocks,
  hasBlocks,
  validationErrors,
  showBlockTypeSelector,
  onNameChange,
  onTypeChange,
  handleAddSet,
  handleSetUpdate,
  handleExerciseOptions,
  handleReorderClick,
  handleSelectExercises,
  handleAddBlock,
  handleBlockTypeSelect,
  handleAddExercisesToBlock,
  handleReorderBlock,
  setShowBlockTypeSelector,
  getUnblockedExercises,
  isEditing = false,
}) => {
  const unblockedExercises = getUnblockedExercises();

  return (
    <div className="animate-fade-in">
      <Card>
        <CardHeader title={isEditing ? "Editar Rutina" : "Crear Nueva Rutina"} />
        <CardBody>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <RoutineForm
              routineName={routineName}
              routineType={routineType}
              validationErrors={validationErrors}
              onNameChange={onNameChange}
              onTypeChange={onTypeChange}
            />
            
            {hasBlocks ? (
              // Block-based system
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">Bloques de Ejercicios</h3>
                </div>
                
                <WorkoutBlocksList
                  blocks={workoutBlocks}
                  routineExercises={routineExercises}
                  onAddSet={handleAddSet}
                  onSetUpdate={handleSetUpdate}
                  onExerciseOptions={handleExerciseOptions}
                  onAddExercises={handleAddExercisesToBlock}
                  onReorderClick={handleReorderBlock}
                />

                {/* Show any exercises not in blocks (for backward compatibility) */}
                {unblockedExercises.length > 0 && (
                  <div className="border-t pt-4">
                    <ExerciseList
                      exercises={unblockedExercises.map(item => item.exercise)}
                      onAddSet={handleAddSet}
                      onSetUpdate={handleSetUpdate}
                      onExerciseOptions={handleExerciseOptions}
                      onReorderClick={handleReorderClick}
                    />
                  </div>
                )}
              </div>
            ) : (
              // Legacy system (no blocks)
              <ExerciseList
                exercises={routineExercises}
                onAddSet={handleAddSet}
                onSetUpdate={handleSetUpdate}
                onExerciseOptions={handleExerciseOptions}
                onReorderClick={handleReorderClick}
              />
            )}
          </form>
        </CardBody>
      </Card>

      {/* Add Block Button (always visible) */}
      <AddBlockButton onClick={handleAddBlock} />

      {/* Block Type Selector Dialog */}
      <BlockTypeSelector
        isOpen={showBlockTypeSelector}
        onClose={() => setShowBlockTypeSelector(false)}
        onSelectType={handleBlockTypeSelect}
      />
    </div>
  );
};

export default RoutineFormContainer;