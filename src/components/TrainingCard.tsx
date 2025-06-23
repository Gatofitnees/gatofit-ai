
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
    <Card className="h-full">
      <CardHeader 
        title="Entrenamiento Completado" 
        icon={<Check className="h-5 w-5 text-primary" />} 
      />
      <CardBody className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{workout.name}</h4>
            {workout.calories && workout.calories > 0 && (
              <div className="flex items-center text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                <Flame className="h-3.5 w-3.5 mr-1" />
                <span>{workout.calories} kcal</span>
              </div>
            )}
          </div>
          
          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {workout.duration && (
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{workout.duration}</span>
              </div>
            )}
            
            {workout.exerciseCount && (
              <div className="flex items-center">
                <Dumbbell className="h-3.5 w-3.5 mr-1" />
                <span>{workout.exerciseCount} ejercicios</span>
              </div>
            )}
            
            {workout.totalSets && (
              <div className="flex items-center">
                <Target className="h-3.5 w-3.5 mr-1" />
                <span>{workout.totalSets} series</span>
              </div>
            )}
          </div>
          
          {workout.exercises && workout.exercises.length > 0 && (
            <div className="bg-background/40 rounded-lg p-3">
              <span className="text-xs text-muted-foreground block mb-2">Ejercicios realizados:</span>
              <div className="flex flex-wrap gap-1">
                {workout.exercises.map((exercise, exerciseIndex) => (
                  <span 
                    key={exerciseIndex}
                    className="text-xs px-2 py-1 bg-background/80 rounded-full border border-white/10"
                  >
                    {exercise}
                  </span>
                ))}
                {workout.exerciseCount && workout.exerciseCount > workout.exercises.length && (
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    +{workout.exerciseCount - workout.exercises.length} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardBody>
      <CardFooter className="flex justify-between mt-auto">
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
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentWorkoutIndex 
                    ? "bg-primary scale-110" 
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
