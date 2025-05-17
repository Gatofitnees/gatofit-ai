
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dumbbell, Info } from "lucide-react";
import Button from "@/components/Button";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main?: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
}

interface ExerciseListItemProps {
  exercise: Exercise;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  exercise,
  isSelected,
  onToggleSelect,
  onViewDetails
}) => {
  return (
    <div className="flex items-center">
      <Checkbox
        id={`select-${exercise.id}`}
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(exercise.id)}
        className="mr-3 h-5 w-5 rounded-full bg-background"
      />
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
        <Dumbbell className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{exercise.name}</h3>
        <span className="text-xs text-muted-foreground">{exercise.muscle_group_main}</span>
      </div>
      <Button 
        variant="outline"
        size="sm"
        className="min-w-0 p-1"
        onClick={() => onViewDetails(exercise.id)}
      >
        <Info className="h-4 w-4 text-primary" />
      </Button>
    </div>
  );
};

export default ExerciseListItem;
