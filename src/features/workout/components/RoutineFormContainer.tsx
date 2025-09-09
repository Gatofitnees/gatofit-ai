
import React from "react";
import { Card, CardHeader, CardBody } from "@/components/Card";
import { RoutineExercise, WorkoutBlock } from "../types";
import RoutineForm from "./RoutineForm";
import WorkoutBlocksList from "./blocks/WorkoutBlocksList";
import BlockTypeSelector from "./blocks/BlockTypeSelector";

interface RoutineFormContainerProps {
  routineName: string;
  routineType: string;
  routineExercises: RoutineExercise[];
  workoutBlocks: WorkoutBlock[];
  validationErrors: {
    name: boolean;
    type: boolean;
  };
  onNameChange: (name: string) => void;
  onTypeChange: (type: string) => void;
  
  // Block handlers
  onAddBlock: () => void;
  onAddExercisesToBlock: (blockIndex: number) => void;
  onAddSetToBlock: (blockIndex: number, exerciseIndex: number) => void;
  onSetUpdateInBlock: (blockIndex: number, exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  onExerciseOptionsInBlock: (blockIndex: number, exerciseIndex: number) => void;
  onReorderClickInBlock: (blockIndex: number) => void;
  
  // Block type selector
  showBlockTypeSelector: boolean;
  onBlockTypeSelectorClose: () => void;
  onBlockTypeSelect: (type: any) => void;
  
  isEditing?: boolean;
}

const RoutineFormContainer: React.FC<RoutineFormContainerProps> = ({
  routineName,
  routineType,
  routineExercises,
  workoutBlocks,
  validationErrors,
  onNameChange,
  onTypeChange,
  onAddBlock,
  onAddExercisesToBlock,
  onAddSetToBlock,
  onSetUpdateInBlock,
  onExerciseOptionsInBlock,
  onReorderClickInBlock,
  showBlockTypeSelector,
  onBlockTypeSelectorClose,
  onBlockTypeSelect,
  isEditing = false,
}) => {
  return (
    <div className="animate-fade-in">
      <Card>
        <CardHeader title={isEditing ? "Editar Rutina" : "Crear Nueva Rutina"} />
        <CardBody>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <RoutineForm
              routineName={routineName}
              routineType={routineType}
              validationErrors={validationErrors}
              onNameChange={onNameChange}
              onTypeChange={onTypeChange}
            />
            
            <WorkoutBlocksList
              blocks={workoutBlocks}
              onAddSet={onAddSetToBlock}
              onSetUpdate={onSetUpdateInBlock}
              onExerciseOptions={onExerciseOptionsInBlock}
              onAddExercises={onAddExercisesToBlock}
              onReorderClick={onReorderClickInBlock}
              onAddBlock={onAddBlock}
            />
            
            <BlockTypeSelector
              isOpen={showBlockTypeSelector}
              onClose={onBlockTypeSelectorClose}
              onSelectType={onBlockTypeSelect}
            />
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default RoutineFormContainer;
