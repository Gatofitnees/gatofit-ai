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
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">Ejercicios</h3>
                {routineExercises.length > 0 && !hasBlocks && (
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80"
                    onClick={handleReorderClick}
                  >
                    Ordenar
                  </button>
                )}
              </div>
              
              {hasBlocks ? (
                // Block-based system
                <>
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
                </>
              ) : (
                // Legacy system (no blocks) - show exercises directly
                <>
                  {routineExercises.length > 0 ? (
                    <div className="space-y-3">
                      {routineExercises.map((exercise, index) => (
                        <div key={`${exercise.id}-${index}`} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-foreground">{exercise.name}</h4>
                              <p className="text-xs text-muted-foreground capitalize">
                                {exercise.muscle_group_main} • {exercise.equipment_required}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleExerciseOptions(index)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                              </svg>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {exercise.sets.map((set, setIndex) => (
                              <div key={setIndex} className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-center">Serie {setIndex + 1}</div>
                                <div className="text-center">{set.reps_min}-{set.reps_max} reps</div>
                                <div className="text-center">{set.rest_seconds}s descanso</div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddSet(index)}
                              className="w-full py-1 text-xs text-primary hover:text-primary/80 border border-dashed border-primary/30 rounded"
                            >
                              + Añadir serie
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay ejercicios seleccionados</p>
                      <button
                        type="button"
                        onClick={(e) => handleSelectExercises(e)}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Añadir Ejercicios
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
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