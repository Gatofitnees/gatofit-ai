
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeableCarouselProps {
  children: React.ReactNode[];
  className?: string;
  reduceSize?: boolean;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  currentSlide?: number;
  onSlideChange?: (index: number) => void;
  cardsPerView?: number;
}

const SwipeableCarousel: React.FC<SwipeableCarouselProps> = ({ 
  children, 
  className, 
  reduceSize = false,
  autoScroll = false,
  autoScrollInterval = 5000,
  currentSlide,
  onSlideChange,
  cardsPerView = 1
}) => {
  const [internalCurrentIndex, setInternalCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use either controlled (from props) or uncontrolled (internal) state
  const currentIndex = currentSlide !== undefined ? currentSlide : internalCurrentIndex;
  
  // Update internal state when prop changes
  useEffect(() => {
    if (currentSlide !== undefined) {
      setInternalCurrentIndex(currentSlide);
    }
  }, [currentSlide]);
  
  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && !isDragging) {
      autoScrollTimerRef.current = setTimeout(() => {
        const nextIndex = (currentIndex + 1) % children.length;
        goToSlide(nextIndex);
      }, autoScrollInterval);
    }
    
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, [autoScroll, currentIndex, children.length, isDragging]);
  
  // Calculate item width based on container and cards per view
  const getItemWidth = (): number => {
    if (!containerRef.current) return 0;
    return containerRef.current.offsetWidth / cardsPerView;
  };
  
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Clear auto-scroll timer
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }
    
    setIsDragging(true);
    setDragOffset(0);
    
    // Get position from touch or mouse event
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
      
    setDragStart(clientX);
    
    // Prevent default browser behavior
    e.preventDefault();
  };
  
  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    // Get position from touch or mouse event
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
      
    const offset = clientX - dragStart;
    setDragOffset(offset);
    
    // Prevent default browser behavior
    e.preventDefault();
  };
  
  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    const itemWidth = getItemWidth();
    const threshold = itemWidth * 0.15; // 15% threshold to change slide (more sensitive)
    
    if (dragOffset > threshold && currentIndex > 0) {
      // Swipe right - go to previous
      goToSlide(currentIndex - 1);
    } else if (dragOffset < -threshold && currentIndex < children.length - 1) {
      // Swipe left - go to next
      goToSlide(currentIndex + 1);
    } else {
      // Stay on current slide - snap back
      setDragOffset(0);
    }
    
    setIsDragging(false);
    
    // Prevent default browser behavior
    e.preventDefault();
  };

  const goToSlide = (index: number) => {
    const newIndex = Math.max(0, Math.min(children.length - 1, index));
    
    if (onSlideChange) {
      onSlideChange(newIndex);
    } else {
      setInternalCurrentIndex(newIndex);
    }
    
    setDragOffset(0);
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDragOffset(0); // Reset drag offset on resize
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate container and item dimensions
  const containerWidth = containerRef.current?.offsetWidth || 0;
  const slideWidth = reduceSize ? containerWidth * (0.8 / cardsPerView) : containerWidth / cardsPerView;
  const slideMargin = reduceSize ? containerWidth * 0.1 / cardsPerView : 0;
  
  return (
    <div 
      className={cn('relative overflow-hidden w-full touch-none', className)} 
      ref={containerRef}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <motion.div
        className="flex w-full"
        animate={{ 
          x: isDragging 
            ? dragOffset - (currentIndex * slideWidth * cardsPerView)
            : -(currentIndex * slideWidth * cardsPerView)
        }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 40,
          duration: 0.3 
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div 
            className="flex-shrink-0 transition-opacity duration-300"
            style={{ 
              width: slideWidth, 
              marginLeft: index === 0 ? 0 : slideMargin,
              marginRight: index === children.length - 1 ? 0 : slideMargin,
              touchAction: 'none',
              maxHeight: '100%',
              opacity: currentIndex === index ? 1 : 0.6
            }}
            key={index}
          >
            {child}
          </div>
        ))}
      </motion.div>
      
      {/* Enhanced indicators with better visibility and tap targets */}
      <div className="flex justify-center space-x-3 mt-4">
        {children.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-colors border",
              index === currentIndex 
                ? "bg-primary border-primary scale-110" 
                : "bg-muted border-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            onClick={(e) => {
              e.preventDefault();
              goToSlide(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeableCarousel;
