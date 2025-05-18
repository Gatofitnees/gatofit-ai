
import React from "react";
import { Info, Dumbbell } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "@/components/Button";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
}

interface ExerciseItemProps {
  exercise: Exercise;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, isSelected, onSelect, onViewDetails }) => {
  return (
    <Card className="hover:scale-[1.01] transition-transform duration-300">
      <CardBody>
        <div className="flex items-center">
          <Checkbox
            id={`select-${exercise.id}`}
            checked={isSelected}
            onCheckedChange={() => onSelect(exercise.id)}
            className="mr-3 h-5 w-5 rounded-full bg-background"
          />
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{exercise.name}</h3>
            <span className="text-xs text-muted-foreground">{exercise.muscle_group_main}</span>
            {exercise.equipment_required && (
              <span className="text-xs text-muted-foreground ml-2">· {exercise.equipment_required}</span>
            )}
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
      </CardBody>
    </Card>
  );
};

export default ExerciseItem;
