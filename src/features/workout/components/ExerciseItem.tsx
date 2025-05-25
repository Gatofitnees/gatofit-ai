
import React from "react";
import { Plus, Grip, MoreVertical } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { RoutineExercise } from "../types";
import ExerciseSet from "./ExerciseSet";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleExerciseNameClick = () => {
    navigate(`/exercise-details/${exercise.id}`);
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
              e.preventDefault(); // Prevent form submission
              onExerciseOptions(index);
            }}
            type="button"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {exercise.sets.map((set, setIndex) => (
          <ExerciseSet 
            key={`set-${setIndex}`}
            set={set}
            setIndex={setIndex}
            exerciseId={exercise.id}
            exerciseName={exercise.name}
            onSetUpdate={(setIndex, field, value) => onSetUpdate(index, setIndex, field, value)}
          />
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full"
          onClick={(e) => {
            e.preventDefault(); // Prevent form submission
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
