
import React from "react";
import { MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";

interface ExerciseSetData {
  set_number: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

interface ExerciseSetProps {
  id: number;
  name: string;
  muscleGroup?: string;
  equipment?: string;
  sets: ExerciseSetData[];
  onAddSet: () => void;
  onSetUpdate: (setIndex: number, field: string, value: number) => void;
  onOptionsClick: () => void;
  onExerciseNameClick: (exerciseId: number) => void;
}

const ExerciseSet: React.FC<ExerciseSetProps> = ({
  id,
  name,
  muscleGroup,
  equipment,
  sets,
  onAddSet,
  onSetUpdate,
  onOptionsClick,
  onExerciseNameClick,
}) => {
  return (
    <div className="bg-white shadow-neu-button rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 
              className="font-medium cursor-pointer hover:text-primary transition-colors"
              onClick={() => onExerciseNameClick(id)}
            >
              {name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {muscleGroup}
              {equipment && ` • ${equipment}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="bg-secondary/20 text-xs px-2 py-1 rounded-full">
              {sets.length} {sets.length === 1 ? 'serie' : 'series'}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onOptionsClick}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Sets */}
        <div className="space-y-2">
          {sets.map((set, setIndex) => (
            <div key={setIndex} className="grid grid-cols-4 gap-2 items-center p-2 bg-secondary/10 rounded-lg">
              <div className="text-sm font-medium">
                Serie {set.set_number}
              </div>
              
              <div className="flex items-center space-x-1">
                <NumericInput
                  value={set.reps_min.toString()}
                  onChange={(e) => onSetUpdate(setIndex, 'reps_min', parseInt(e.target.value) || 0)}
                  className="h-8 text-center text-xs"
                  placeholder="Min"
                />
                <span className="text-xs">-</span>
                <NumericInput
                  value={set.reps_max.toString()}
                  onChange={(e) => onSetUpdate(setIndex, 'reps_max', parseInt(e.target.value) || 0)}
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
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onAddSet}
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          Añadir serie
        </Button>
      </div>
    </div>
  );
};

export default ExerciseSet;
