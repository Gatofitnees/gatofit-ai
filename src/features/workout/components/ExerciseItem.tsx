
import React from "react";
import { Plus, Grip, MoreVertical } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { RoutineExercise } from "../types";
import { NumericInput } from "@/components/ui/numeric-input";

interface ExerciseItemProps {
  exercise: RoutineExercise;
  index: number;
  onAddSet: (index: number) => void;
  onSetUpdate: (exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  onExerciseOptions: (index: number) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ 
  exercise, 
  index, 
  onAddSet, 
  onSetUpdate, 
  onExerciseOptions 
}) => {
  const handleExerciseNameClick = () => {
    window.location.href = `/exercises/${exercise.id}`;
  };

  return (
    <Card className="bg-secondary/40">
      <CardBody>
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Grip className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h4 
              className="font-medium cursor-pointer hover:text-primary transition-colors"
              onClick={handleExerciseNameClick}
            >
              {exercise.name}
            </h4>
            <span className="text-xs text-muted-foreground">{exercise.muscle_group_main}</span>
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="min-w-0 p-1"
            onClick={(e) => {
              e.preventDefault();
              onExerciseOptions(index);
            }}
            type="button"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {exercise.sets.map((set, setIndex) => (
          <div key={`set-${setIndex}`} className="grid grid-cols-4 gap-2 items-center p-2 bg-secondary/10 rounded-lg mb-2">
            <div className="text-sm font-medium">
              Serie {setIndex + 1}
            </div>
            
            <div className="flex items-center space-x-1">
              <NumericInput
                value={set.reps_min.toString()}
                onChange={(e) => onSetUpdate(index, setIndex, 'reps_min', parseInt(e.target.value) || 0)}
                className="h-8 text-center text-xs"
                placeholder="Min"
              />
              <span className="text-xs">-</span>
              <NumericInput
                value={set.reps_max.toString()}
                onChange={(e) => onSetUpdate(index, setIndex, 'reps_max', parseInt(e.target.value) || 0)}
                className="h-8 text-center text-xs"
                placeholder="Max"
              />
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              {set.rest_seconds}s descanso
            </div>
            
            <div></div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full"
          onClick={(e) => {
            e.preventDefault();
            onAddSet(index);
          }}
          type="button"
        >
          <Plus className="h-3 w-3 mr-1" /> Agregar serie
        </Button>
      </CardBody>
    </Card>
  );
};

export default ExerciseItem;
