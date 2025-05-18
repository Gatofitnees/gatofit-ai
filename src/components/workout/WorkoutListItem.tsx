
import React from "react";
import { Dumbbell, Clock } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";

interface WorkoutRoutine {
  id: number;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
}

interface WorkoutListItemProps {
  routine: WorkoutRoutine;
  onStartWorkout: (id: number) => void;
}

const WorkoutListItem: React.FC<WorkoutListItemProps> = ({ routine, onStartWorkout }) => {
  return (
    <Card key={routine.id} className="hover:scale-[1.01] transition-transform duration-300">
      <CardBody>
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{routine.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {routine.type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {routine.type}
                </span>
              )}
              {routine.estimated_duration_minutes && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {routine.estimated_duration_minutes} min
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                {routine.exercise_count} ejercicios
              </span>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => onStartWorkout(routine.id)}
          >
            Iniciar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default WorkoutListItem;
