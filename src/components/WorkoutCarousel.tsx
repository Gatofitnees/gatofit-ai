
import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

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
  onSlideChange?: (index: number) => void;
}

const WorkoutCarousel: React.FC<WorkoutCarouselProps> = ({ workouts, children, onSlideChange }) => {
  if (workouts.length === 0) {
    return null;
  }

  if (workouts.length === 1) {
    return <>{children(workouts[0], 0, 1)}</>;
  }

  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {workouts.map((workout, index) => (
          <CarouselItem key={workout.id || index}>
            {children(workout, index, workouts.length)}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default WorkoutCarousel;
