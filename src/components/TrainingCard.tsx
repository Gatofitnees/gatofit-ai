
import React from "react";
import { Check, ChevronRight, Plus, Clock, Flame } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import Button from "./Button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutSummary {
  id?: number;
  name: string;
  duration?: string;
  calories?: number;
  exercises?: string[];
  date?: string;
}

interface TrainingCardProps {
  completed?: boolean;
  workout?: WorkoutSummary;
  onStartWorkout: () => void;
  onViewDetails?: () => void;
  loading?: boolean;
}

const TrainingCard: React.FC<TrainingCardProps> = ({
  completed = false,
  workout,
  onStartWorkout,
  onViewDetails,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="mb-5">
        <CardHeader 
          title="Mi Entrenamiento" 
          icon={<Clock className="h-5 w-5" />} 
        />
        <CardBody>
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="mb-5">
      <CardHeader 
        title={completed ? "Entrenamiento Completado" : "Mi Entrenamiento Hoy"} 
        icon={completed ? <Check className="h-5 w-5 text-primary" /> : <Clock className="h-5 w-5" />} 
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
              <div className="bg-background/40 rounded-lg p-2">
                <span className="text-xs text-muted-foreground block mb-1">Ejercicios clave:</span>
                <div className="flex flex-wrap gap-1">
                  {workout.exercises.map((exercise, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-0.5 bg-background/80 rounded-full"
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
            <div className="bg-background/40 rounded-lg p-3 mb-3">
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
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Ver Detalles
            </Button>
            <Button 
              variant="primary"
              size="sm"
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
