
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface WorkoutCarouselProps {
  workouts: WorkoutSummary[];
  children: (workout: WorkoutSummary, index: number, total: number) => React.ReactNode;
}

const WorkoutCarousel: React.FC<WorkoutCarouselProps> = ({ workouts, children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (workouts.length === 0) {
    return null;
  }

  if (workouts.length === 1) {
    return <>{children(workouts[0], 0, 1)}</>;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? workouts.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === workouts.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative">
      {/* Navigation buttons */}
      {workouts.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-background/80 border border-muted shadow-sm hover:bg-background transition-colors"
            aria-label="Entrenamiento anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-background/80 border border-muted shadow-sm hover:bg-background transition-colors"
            aria-label="Siguiente entrenamiento"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Workout content */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {workouts.map((workout, index) => (
            <div key={workout.id || index} className="w-full flex-shrink-0">
              {children(workout, index, workouts.length)}
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      {workouts.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="flex items-center gap-1">
            {workouts.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentIndex 
                    ? "bg-primary" 
                    : "bg-muted hover:bg-muted-foreground/50"
                )}
                aria-label={`Ir al entrenamiento ${index + 1}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            {currentIndex + 1} de {workouts.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default WorkoutCarousel;
