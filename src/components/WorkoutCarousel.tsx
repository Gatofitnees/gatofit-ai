
import React, { useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, useCarousel } from '@/components/ui/carousel';

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

const WorkoutCarouselContent: React.FC<WorkoutCarouselProps> = ({ workouts, children, onSlideChange }) => {
  const { api } = useCarousel();

  useEffect(() => {
    if (!api || !onSlideChange) return;

    const onSelect = () => {
      const currentIndex = api.selectedScrollSnap();
      onSlideChange(currentIndex);
    };

    // Set initial index
    onSlideChange(0);

    // Listen for slide changes
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSlideChange]);

  return (
    <CarouselContent>
      {workouts.map((workout, index) => (
        <CarouselItem key={workout.id || index} className="basis-full">
          {children(workout, index, workouts.length)}
        </CarouselItem>
      ))}
    </CarouselContent>
  );
};

const WorkoutCarousel: React.FC<WorkoutCarouselProps> = ({ workouts, children, onSlideChange }) => {
  if (workouts.length === 0) {
    return null;
  }

  if (workouts.length === 1) {
    return <>{children(workouts[0], 0, 1)}</>;
  }

  return (
    <Carousel className="w-full" opts={{ loop: false }}>
      <WorkoutCarouselContent workouts={workouts} onSlideChange={onSlideChange}>
        {children}
      </WorkoutCarouselContent>
    </Carousel>
  );
};

export default WorkoutCarousel;
