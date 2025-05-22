
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus } from "lucide-react";
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
                {exercises.map((exercise, index) => (
                  <Draggable key={exercise.id.toString()} draggableId={exercise.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-3 bg-secondary/40 rounded-lg border border-white/10 flex items-center"
                      >
                        <GripVertical className="h-5 w-5 mr-3 text-muted-foreground" />
                        <span className="font-medium">{exercise.name}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <>
          {exercises.map((exercise, exerciseIndex) => (
            <ExerciseCard
              key={`${exercise.id}-${exerciseIndex}`}
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              onInputChange={onInputChange}
              onAddSet={onAddSet}
              onNotesChange={onNotesChange}
              onViewDetails={onViewDetails}
              onShowStats={onShowStats}
            />
          ))}
          
          {/* Add Exercise Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={onAddExercise}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir ejercicio
          </Button>
        </>
      )}
    </div>
  );
};
