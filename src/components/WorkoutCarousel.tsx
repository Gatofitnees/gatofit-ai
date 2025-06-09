
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
      console.log('Carousel slide changed to index:', currentIndex);
      onSlideChange(currentIndex);
    };

    // Set initial index immediately
    setTimeout(() => onSlideChange(0), 0);

    // Listen for slide changes
    api.on('select', onSelect);
    api.on('settle', onSelect); // Additional event for when animation settles

    return () => {
      api.off('select', onSelect);
      api.off('settle', onSelect);
    };
  }, [api, onSlideChange]);

  return (
    <CarouselContent className="-ml-2 md:-ml-4">
      {workouts.map((workout, index) => (
        <CarouselItem key={workout.id || index} className="basis-full pl-2 md:pl-4">
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
    <Carousel 
      className="w-full" 
      opts={{ 
        loop: false,
        duration: 20, // Faster animation for mobile
        dragFree: true, // Smooth drag on mobile
        skipSnaps: false,
        align: 'start'
      }}
    >
      <WorkoutCarouselContent workouts={workouts} onSlideChange={onSlideChange}>
        {children}
      </WorkoutCarouselContent>
    </Carousel>
  );
};

export default WorkoutCarousel;
