
import React, { useState } from "react";
import { Check, ChevronRight, Plus, Clock, Flame, Dumbbell, Target } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import Button from "./Button";
import WorkoutCarousel from "./WorkoutCarousel";
import PromoVideoCard from "./PromoVideoCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutSummary {
  id?: number;
  name: string;
  duration?: string;
  calories?: number;
  exercises?: string[];
  exerciseCount?: number;
  totalSets?: number;
  date?: string;
}

interface TrainingCardProps {
  completed?: boolean;
  workouts?: WorkoutSummary[];
  onStartWorkout: () => void;
  onViewDetails?: (workoutId?: number) => void;
  loading?: boolean;
}

const TrainingCard: React.FC<TrainingCardProps> = ({
  completed = false,
  workouts = [],
  onStartWorkout,
  onViewDetails,
  loading = false
}) => {
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);

  const handleSlideChange = (index: number) => {
    setCurrentWorkoutIndex(index);
  };

  if (loading) {
    return (
      <div className="mb-5">
        <Card>
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
      </div>
    );
  }

  const renderCompletedWorkoutCard = (workout: WorkoutSummary, index: number, total: number) => (
    <Card className="min-h-[140px]">
      <CardBody className="flex flex-col justify-between h-full p-4">
        <div className="space-y-3">
          {/* Title with blue check */}
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <h4 className="font-medium">{workout.name}</h4>
          </div>
          
          {/* Stats in elegant boxes */}
          <div className="flex items-center gap-3 text-sm">
            {workout.duration && (
              <div className="flex items-center gap-1 px-2 py-1 bg-secondary/20 rounded-lg">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-muted-foreground">{workout.duration}</span>
              </div>
            )}
            
            {workout.exerciseCount && (
              <div className="flex items-center gap-1 px-2 py-1 bg-secondary/20 rounded-lg">
                <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{workout.exerciseCount} ejercicios</span>
              </div>
            )}
            
            {workout.totalSets && (
              <div className="flex items-center gap-1 px-2 py-1 bg-secondary/20 rounded-lg">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{workout.totalSets} series</span>
              </div>
            )}
          </div>

          {workout.calories && workout.calories > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-orange-500 font-medium">{workout.calories} kcal</span>
            </div>
          )}
          
          {/* Exercises section */}
          {workout.exercises && workout.exercises.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Ejercicios realizados:</span>
              <div className="text-sm">
                <span className="text-foreground">{workout.exercises[0]}</span>
                {workout.exerciseCount && workout.exerciseCount > 1 && (
                  <span className="ml-2 text-primary font-medium">
                    +{workout.exerciseCount - 1} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardBody>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => onViewDetails && onViewDetails(workout.id)}
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
      </CardFooter>
    </Card>
  );

  // Crear array de elementos del carrusel: siempre incluir la tarjeta promocional como primer elemento
  const carouselItems = [
    { type: 'promo' as const },
    ...workouts.map(workout => ({ type: 'workout' as const, data: workout }))
  ];

  const totalItems = carouselItems.length;

  return (
    <div className="mb-5">
      <div className="space-y-3">
        <WorkoutCarousel 
          items={carouselItems}
          onSlideChange={handleSlideChange}
        >
          {(item, index, total) => {
            if (item.type === 'promo') {
              return <PromoVideoCard onStartWorkout={onStartWorkout} />;
            } else {
              return renderCompletedWorkoutCard(item.data, index - 1, total - 1);
            }
          }}
        </WorkoutCarousel>
        
        {/* Indicadores del carrusel */}
        {totalItems > 1 && (
          <div className="flex items-center justify-center gap-1">
            {carouselItems.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentWorkoutIndex 
                    ? "bg-primary" 
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingCard;
