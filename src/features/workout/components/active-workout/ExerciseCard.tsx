
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Copy, Pencil } from "lucide-react";
import SetRow from "./SetRow";
import { ExerciseNotesDialog } from "./ExerciseNotesDialog";

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

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  onInputChange: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void;
  onAddSet: (exerciseIndex: number) => void;
  onNotesChange: (exerciseIndex: number, notes: string) => void;
  onViewDetails: (exerciseId: number) => void;
  onShowStats: (exerciseId: number) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  onInputChange,
  onAddSet,
  onNotesChange,
  onViewDetails,
  onShowStats
}) => {
  const [showNotesDialog, setShowNotesDialog] = useState(false);

  const handleNotesClick = () => {
    setShowNotesDialog(true);
  };

  const handleSaveNotes = (notes: string) => {
    onNotesChange(exerciseIndex, notes);
  };

  return (
    <>
      <Card key={`${exercise.id}-${exerciseIndex}`} className="bg-secondary/40 border border-white/5 overflow-hidden p-0">
        <div className="p-4">
          {/* Exercise Header */}
          <div className="flex items-center justify-between mb-3">
            <div 
              className="flex-1 cursor-pointer" 
              onClick={() => onViewDetails(exercise.id)}
            >
              <h3 className="font-medium text-base">{exercise.name}</h3>
              <p className="text-xs text-muted-foreground">
                {exercise.muscle_group_main}
                {exercise.equipment_required && ` • ${exercise.equipment_required}`}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowStats(exercise.id)}
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              Estadísticas
            </Button>
          </div>
          
          {/* Sets */}
          <div className="space-y-3">
            {/* Header for the table-like layout */}
            <div className="grid grid-cols-4 gap-2 px-2">
              <div className="text-xs font-medium text-muted-foreground">Serie</div>
              <div className="text-xs font-medium text-muted-foreground">Ant</div>
              <div className="text-xs font-medium text-muted-foreground">Peso</div>
              <div className="text-xs font-medium text-muted-foreground">Reps</div>
            </div>
            
            {exercise.sets.map((set, setIndex) => (
              <SetRow 
                key={`set-${setIndex}`} 
                set={set} 
                exerciseIndex={exerciseIndex}
                setIndex={setIndex}
                onInputChange={onInputChange}
              />
            ))}
          </div>
          
          {/* Exercise Actions */}
          <div className="mt-3 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => onAddSet(exerciseIndex)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Añadir serie
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={handleNotesClick}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Notas
            </Button>
          </div>
        </div>
      </Card>

      {/* Notes Dialog */}
      <ExerciseNotesDialog
        isOpen={showNotesDialog}
        onClose={() => setShowNotesDialog(false)}
        exerciseName={exercise.name}
        notes={exercise.notes}
        onSave={handleSaveNotes}
      />
    </>
  );
};
