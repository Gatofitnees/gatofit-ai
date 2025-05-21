
import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronRight, Dumbbell } from "lucide-react";
import Button from "@/components/Button";

interface WorkoutRoutine {
  id: number;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
  is_predefined?: boolean;
}

interface WorkoutListItemProps {
  routine: WorkoutRoutine;
  onStartWorkout: (id: number) => void;
}

const WorkoutListItem: React.FC<WorkoutListItemProps> = ({
  routine,
  onStartWorkout
}) => {
  const navigate = useNavigate();
  const { id, name, type, estimated_duration_minutes: estimatedDurationMinutes, exercise_count: exerciseCount, is_predefined } = routine;
  
  const handleItemClick = () => {
    navigate(`/workout/routine/${id}`);
  };
  
  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartWorkout(id);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-neu-button p-4 mb-4 hover:shadow-neu-button-hover transition-all cursor-pointer"
      onClick={handleItemClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-medium text-base mb-1">{name}</h3>
            {is_predefined && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Predefinida
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{estimatedDurationMinutes || 30} min</span>
            {exerciseCount !== undefined && (
              <span className="ml-2">• {exerciseCount} ejercicios</span>
            )}
            {type && (
              <span className="ml-2">• {type}</span>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="mt-3">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={handleStartClick}
          type="button"
        >
          Iniciar
        </Button>
      </div>
    </div>
  );
};

export default WorkoutListItem;
