
import React, { useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, useCarousel } from '@/components/ui/carousel';
import { useCarouselHeight } from '@/hooks/useCarouselHeight';
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

type CarouselItem = 
  | { type: 'promo' }
  | { type: 'workout'; data: WorkoutSummary };

interface WorkoutCarouselProps {
  items: CarouselItem[];
  children: (item: CarouselItem, index: number, total: number, setRef?: (element: HTMLDivElement | null) => void) => React.ReactNode;
  onSlideChange?: (index: number) => void;
}

const WorkoutCarouselContent: React.FC<WorkoutCarouselProps> = ({ items, children, onSlideChange }) => {
  const { api } = useCarousel();
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  
  const { containerHeight, setItemRef, isTransitioning } = useCarouselHeight({
    currentIndex: currentSlideIndex,
    itemsCount: items.length
  });

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const currentIndex = api.selectedScrollSnap();
      console.log('Carousel slide changed to index:', currentIndex);
      setCurrentSlideIndex(currentIndex);
      onSlideChange?.(currentIndex);
    };

    // Set initial index immediately
    setTimeout(() => {
      setCurrentSlideIndex(0);
      onSlideChange?.(0);
    }, 0);

    // Listen for slide changes
    api.on('select', onSelect);
    api.on('settle', onSelect);
    api.on('pointerUp', onSelect);

    return () => {
      api.off('select', onSelect);
      api.off('settle', onSelect);
      api.off('pointerUp', onSelect);
    };
  }, [api, onSlideChange]);

  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-in-out overflow-hidden",
        isTransitioning && "will-change-[height]"
      )}
      style={{ 
        height: containerHeight > 0 ? `${containerHeight}px` : 'auto'
      }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {items.map((item, index) => (
          <CarouselItem key={`${item.type}-${index}`} className="basis-full pl-2 md:pl-4">
            <div
              ref={setItemRef(index)}
              className="w-full"
            >
              {children(item, index, items.length, setItemRef(index))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </div>
  );
};

const WorkoutCarousel: React.FC<WorkoutCarouselProps> = ({ items, children, onSlideChange }) => {
  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return (
      <div className="w-full">
        {children(items[0], 0, 1)}
      </div>
    );
  }

  return (
    <Carousel 
      className="w-full" 
      opts={{ 
        loop: false,
        duration: 25,
        dragFree: false,
        skipSnaps: false,
        align: 'start',
        containScroll: 'trimSnaps',
        slidesToScroll: 1,
        inViewThreshold: 0.8
      }}
    >
      <WorkoutCarouselContent items={items} onSlideChange={onSlideChange}>
        {children}
      </WorkoutCarouselContent>
    </Carousel>
  );
};

export default WorkoutCarousel;
