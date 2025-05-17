
import React from "react";
import { Dumbbell, Clock } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";

export interface WorkoutRoutine {
  id: string | number;
  name: string;
  type: string;
  duration: string;
  exercises: number;
}

interface RoutineCardProps {
  routine: WorkoutRoutine;
  onStart: (routineId: string | number) => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onStart }) => {
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
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {routine.type}
              </span>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {routine.duration}
              </div>
              <span className="text-xs text-muted-foreground">
                {routine.exercises} ejercicios
              </span>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => onStart(routine.id)}
          >
            Iniciar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default RoutineCard;
