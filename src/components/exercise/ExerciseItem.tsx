
import React from "react";
import { ChevronRight, Check } from "lucide-react";
import ExercisePreview from "./ExercisePreview";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  image_url?: string;
}

interface ExerciseItemProps {
  exercise: Exercise;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onViewDetails: (id: number) => void;
  isAlreadyInRoutine?: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ 
  exercise, 
  isSelected, 
  onSelect, 
  onViewDetails,
  isAlreadyInRoutine = false
}) => {
  return (
    <div 
      className={`relative p-3 rounded-lg border flex items-center space-x-4 cursor-pointer ${
        isSelected 
          ? 'border-primary/70 bg-primary/10' 
          : 'border-border/50 hover:border-border'
      } ${
        isAlreadyInRoutine ? 'opacity-60' : ''
      }`}
      onClick={() => onSelect(exercise.id)}
    >
      {/* Exercise Preview */}
      <ExercisePreview imageUrl={exercise.image_url} exerciseName={exercise.name} />
      
      {/* Exercise info */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-base">
              {exercise.name}
              {isAlreadyInRoutine && (
                <span className="text-xs ml-2 bg-secondary/60 text-secondary-foreground/70 px-2 py-0.5 rounded-full">
                  Ya añadido
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {exercise.muscle_group_main}
              </span>
              {exercise.equipment_required && (
                <span className="text-xs bg-secondary/40 text-muted-foreground px-2 py-0.5 rounded-full">
                  {exercise.equipment_required}
                </span>
              )}
            </div>
          </div>
          
          {/* Selection indicator */}
          <div 
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${
              isSelected ? 'bg-primary text-white' : 'border border-muted-foreground/30'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(exercise.id);
            }}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </div>
        </div>
      </div>
      
      {/* Details button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(exercise.id);
        }}
        className="p-1.5 rounded-full hover:bg-muted"
        aria-label="View exercise details"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default ExerciseItem;
