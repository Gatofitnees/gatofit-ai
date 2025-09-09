import React from "react";
import { Plus } from "lucide-react";
import Button from "@/components/Button";
import ExerciseItem from "../ExerciseItem";
import { WorkoutBlock as WorkoutBlockType } from "../../types";

interface WorkoutBlockProps {
  block: WorkoutBlockType;
  blockIndex: number;
  onAddSet: (blockIndex: number, exerciseIndex: number) => void;
  onSetUpdate: (blockIndex: number, exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  onExerciseOptions: (blockIndex: number, exerciseIndex: number) => void;
  onAddExercises: (blockIndex: number) => void;
  onReorderClick: (blockIndex: number) => void;
}

const WorkoutBlock: React.FC<WorkoutBlockProps> = ({
  block,
  blockIndex,
  onAddSet,
  onSetUpdate,
  onExerciseOptions,
  onAddExercises,
  onReorderClick,
}) => {
  return (
    <div className="space-y-4">
      {/* Block Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold capitalize">
          {block.title}
        </h3>
        <hr className="border-border" />
      </div>

      {/* Exercises Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-base font-medium">Ejercicios</h4>
          {block.exercises.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onReorderClick(blockIndex);
              }}
            >
              Ordenar
            </Button>
          )}
        </div>
        
        {/* Exercise List */}
        {block.exercises.length > 0 ? (
          <div className="space-y-3">
            {block.exercises.map((exercise, exerciseIndex) => (
              <ExerciseItem
                key={`${exercise.id}-${exerciseIndex}`}
                exercise={exercise}
                index={exerciseIndex}
                onAddSet={(idx) => onAddSet(blockIndex, idx)}
                onSetUpdate={(exIdx, setIdx, field, value) => 
                  onSetUpdate(blockIndex, exIdx, setIdx, field, value)
                }
                onExerciseOptions={(idx) => onExerciseOptions(blockIndex, idx)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No hay ejercicios en este bloque
          </div>
        )}

        {/* Add Exercises Button */}
        <Button
          variant={block.exercises.length > 0 ? "secondary" : "primary"}
          fullWidth
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={(e) => {
            e.preventDefault();
            onAddExercises(blockIndex);
          }}
          type="button"
        >
          {block.exercises.length > 0 ? 'Añadir más ejercicios' : 'Añadir Ejercicios'}
        </Button>
      </div>
    </div>
  );
};

export default WorkoutBlock;