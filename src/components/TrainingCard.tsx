
import React from "react";
import { Check, ChevronRight, Plus, Clock, Flame } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import Button from "./Button";
import { cn } from "@/lib/utils";

interface TrainingCardProps {
  completed?: boolean;
  workout?: {
    name: string;
    duration?: string;
    calories?: number;
    exercises?: string[];
  };
  onStartWorkout: () => void;
  onViewDetails?: () => void;
}

const TrainingCard: React.FC<TrainingCardProps> = ({
  completed = false,
  workout,
  onStartWorkout,
  onViewDetails
}) => {
  return (
    <Card className="mb-5">
      <CardHeader 
        title={completed ? "Entrenamiento Completado" : "Mi Entrenamiento Hoy"} 
        icon={completed ? <Check className="h-5 w-5 text-success" /> : <Clock className="h-5 w-5" />} 
      />
      <CardBody>
        {completed && workout ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{workout.name}</h4>
              {workout.calories && (
                <div className="flex items-center text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  <Flame className="h-3.5 w-3.5 mr-1" />
                  <span>{workout.calories} kcal</span>
                </div>
              )}
            </div>
            
            {workout.duration && (
              <div className="text-sm text-muted-foreground">
                Duración: {workout.duration}
              </div>
            )}
            
            {workout.exercises && workout.exercises.length > 0 && (
              <div className="bg-secondary/20 rounded-lg p-2">
                <span className="text-xs text-muted-foreground block mb-1">Ejercicios clave:</span>
                <div className="flex flex-wrap gap-1">
                  {workout.exercises.map((exercise, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-0.5 bg-background/60 rounded-full"
                    >
                      {exercise}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-muted-foreground mb-2">
              Es un buen día para mejorar 💪
            </p>
            <div className="bg-secondary/20 rounded-lg p-3 mb-3">
              <h5 className="text-sm font-medium mb-1">Entrenamiento Sugerido</h5>
              <p className="text-xs text-muted-foreground">
                Basado en tu objetivo y nivel actual
              </p>
            </div>
          </div>
        )}
      </CardBody>
      <CardFooter className={cn("flex", completed ? "justify-between" : "justify-center")}>
        {completed ? (
          <>
            <Button 
              variant="outline"
              size="sm"
              onClick={onViewDetails}
            >
              Ver Detalles
            </Button>
            <Button 
              variant="primary"
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={onStartWorkout}
            >
              Otro Entrenamiento
            </Button>
          </>
        ) : (
          <Button 
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={onStartWorkout}
          >
            Iniciar Entrenamiento
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TrainingCard;
