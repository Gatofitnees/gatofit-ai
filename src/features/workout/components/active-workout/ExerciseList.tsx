
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "./ExerciseCard";

interface WorkoutSet {
  set_number: number;
  weight: number | null;
  reps: number | null;
  notes: string;
  previous_weight: number | null;
  previous_reps: number | null;
}

interface WorkoutExercise {
  id: number;
  name: string;
  sets: WorkoutSet[];
  muscle_group_main?: string;
  equipment_required?: string;
  notes: string;
}

interface ExerciseListProps {
  exercises: WorkoutExercise[];
  isReorderMode: boolean;
  routineId?: string;
  onReorderDrag: (result: any) => void;
  onInputChange: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void;
  onAddSet: (exerciseIndex: number) => void;
  onNotesChange: (exerciseIndex: number, notes: string) => void;
  onViewDetails: (exerciseId: number) => void;
  onShowStats: (exerciseId: number) => void;
  onAddExercise: () => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  isReorderMode,
  routineId,
  onReorderDrag,
  onInputChange,
  onAddSet,
  onNotesChange,
  onViewDetails,
  onShowStats,
  onAddExercise
}) => {
  // Get the routine exercise count from sessionStorage to determine which are temporary
  const getBaseExerciseCount = () => {
    if (!routineId) return exercises.length;
    
    try {
      const tempKey = `temp_exercises_${routineId}`;
      const tempExercises = sessionStorage.getItem(tempKey);
      const tempCount = tempExercises ? JSON.parse(tempExercises).length : 0;
      return exercises.length - tempCount;
    } catch {
      return exercises.length;
    }
  };

  const baseExerciseCount = getBaseExerciseCount();

  return (
    <div className="space-y-6">
      {isReorderMode ? (
        <DragDropContext onDragEnd={onReorderDrag}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {exercises.map((exercise, index) => {
                  const isTemporary = index >= baseExerciseCount;
                  
                  return (
                    <Draggable key={exercise.id.toString()} draggableId={exercise.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 rounded-lg border border-white/10 flex items-center ${
                            isTemporary ? 'bg-orange-500/20' : 'bg-secondary/40'
                          }`}
                        >
                          <GripVertical className="h-5 w-5 mr-3 text-muted-foreground" />
                          <span className="font-medium flex-1">{exercise.name}</span>
                          {isTemporary && (
                            <div className="flex items-center text-xs text-orange-400 ml-2">
                              <Clock className="h-3 w-3 mr-1" />
                              Temporal
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <>
          {exercises.map((exercise, exerciseIndex) => {
            const isTemporary = exerciseIndex >= baseExerciseCount;
            
            return (
              <div key={`${exercise.id}-${exerciseIndex}`} className={isTemporary ? 'relative' : ''}>
                {isTemporary && (
                  <div className="absolute -top-2 right-2 z-10 flex items-center text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3 mr-1" />
                    Temporal
                  </div>
                )}
                <ExerciseCard
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  onInputChange={onInputChange}
                  onAddSet={onAddSet}
                  onNotesChange={onNotesChange}
                  onViewDetails={onViewDetails}
                  onShowStats={onShowStats}
                />
              </div>
            );
          })}
          
          {/* Add Exercise Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={onAddExercise}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir otro ejercicio
          </Button>
        </>
      )}
    </div>
  );
};
