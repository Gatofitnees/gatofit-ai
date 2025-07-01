
import React, { useState } from "react";
import { Check, ChevronRight, Plus, Clock, Flame, Dumbbell, Target } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import Button from "./Button";
import WorkoutCarousel from "./WorkoutCarousel";
import PromoVideoCard from "./PromoVideoCard";
import ProgrammedWorkoutButton from "./ProgrammedWorkoutButton";
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
  onStartWorkout: (routineId?: number) => void;
  onViewDetails?: (workoutId?: number) => void;
  loading?: boolean;
  showProgramModal?: boolean;
  selectedDate: Date;
}

const TrainingCard: React.FC<TrainingCardProps> = ({
  completed = false,
  workouts = [],
  onStartWorkout,
  onViewDetails,
  loading = false,
  showProgramModal = false,
  selectedDate
}) => {
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);

  const handleSlideChange = (index: number) => {
    setCurrentWorkoutIndex(index);
  };

  const handleStartWorkout = () => {
    onStartWorkout();
  };

  const handleProgrammedWorkoutStart = (routineId: number) => {
    onStartWorkout(routineId);
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
      <CardBody>
        <div className="space-y-3">
          {/* Title with check icon and calories badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <h4 className="font-medium text-base truncate">{workout.name}</h4>
            </div>
            {workout.calories && workout.calories > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm flex-shrink-0 ml-2">
                <Flame className="h-4 w-4" />
                <span>{workout.calories} kcal</span>
              </div>
            )}
          </div>
          
          {/* Stats in responsive grid */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            {workout.duration && (
              <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{workout.duration}</span>
              </div>
            )}
            
            {workout.exerciseCount && (
              <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                <Dumbbell className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{workout.exerciseCount} ejercicios</span>
              </div>
            )}
            
            {workout.totalSets && (
              <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{workout.totalSets} series</span>
              </div>
            )}
          </div>
          
          {/* Exercises section with frame */}
          {workout.exercises && workout.exercises.length > 0 && (
            <div className="bg-background/40 rounded-lg p-3">
              <span className="text-xs text-muted-foreground block mb-2">Ejercicios realizados:</span>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-secondary/40 rounded-full border border-white/10">
                  {workout.exercises[0]}
                </span>
                {workout.exercises.length > 1 && (
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    +{workout.exercises.length - 1} más
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
        {/* Solo mostrar los botones de acción en las cards completadas */}
        <div className="flex items-center gap-2">
          <ProgrammedWorkoutButton 
            onStartWorkout={handleProgrammedWorkoutStart}
            showModal={showProgramModal}
            selectedDate={selectedDate}
          />
          <Button 
            variant="primary"
            size="sm"
            onClick={handleStartWorkout}
          >
            Otro Entrenamiento
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  // Crear array de elementos del carrusel: siempre incluir la tarjeta promocional como primer elemento
  const carouselItems = [
    { type: 'promo' as const },
    ...workouts.map(workout => ({ type: 'workout' as const, data: workout }))
  ];

  const totalItems = carouselItems.length;
  
  // Determinar si hay entrenamientos completados para hacer la promo card responsiva
  const hasCompletedWorkouts = workouts.length > 0;

  return (
    <div className="mb-5">
      <div className="space-y-3">
        <WorkoutCarousel 
          items={carouselItems}
          onSlideChange={handleSlideChange}
        >
          {(item, index, total) => {
            if (item.type === 'promo') {
              return (
                <div className="relative">
                  <PromoVideoCard 
                    onStartWorkout={handleStartWorkout} 
                    adaptToWorkoutCards={hasCompletedWorkouts}
                  />
                  {/* Botones posicionados en promo card - Ajustados más arriba y a la izquierda */}
                  <div className="absolute bottom-6 right-6 flex items-center gap-2">
                    <ProgrammedWorkoutButton 
                      onStartWorkout={handleProgrammedWorkoutStart}
                      showModal={showProgramModal}
                      selectedDate={selectedDate}
                    />
                    <Button 
                      variant="primary"
                      size="lg"
                      onClick={handleStartWorkout}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Iniciar
                    </Button>
                  </div>
                </div>
              );
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
