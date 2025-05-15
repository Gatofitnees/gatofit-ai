
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeableCarouselProps {
  children: React.ReactNode[];
  className?: string;
  reduceSize?: boolean;
  autoScroll?: boolean;
  currentSlide?: number;
  onSlideChange?: (index: number) => void;
}

const SwipeableCarousel: React.FC<SwipeableCarouselProps> = ({ 
  children, 
  className, 
  reduceSize = false,
  autoScroll = false,
  currentSlide,
  onSlideChange
}) => {
  const [internalCurrentIndex, setInternalCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use either controlled (from props) or uncontrolled (internal) state
  const currentIndex = currentSlide !== undefined ? currentSlide : internalCurrentIndex;
  
  // Update internal state when prop changes
  useEffect(() => {
    if (currentSlide !== undefined) {
      setInternalCurrentIndex(currentSlide);
    }
  }, [currentSlide]);
  
  // Calculate item width based on container
  const getItemWidth = (): number => {
    if (!containerRef.current) return 0;
    return containerRef.current.offsetWidth;
  };
  
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset(0);
    
    // Get position from touch or mouse event
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
      
    setDragStart(clientX);
  };
  
  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    // Get position from touch or mouse event
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
      
    const offset = clientX - dragStart;
    setDragOffset(offset);
  };
  
  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const itemWidth = getItemWidth();
    const threshold = itemWidth * 0.2; // 20% threshold to change slide
    
    if (dragOffset > threshold && currentIndex > 0) {
      // Swipe right - go to previous
      goToSlide(currentIndex - 1);
    } else if (dragOffset < -threshold && currentIndex < children.length - 1) {
      // Swipe left - go to next
      goToSlide(currentIndex + 1);
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const goToSlide = (index: number) => {
    const newIndex = Math.max(0, Math.min(children.length - 1, index));
    
    if (onSlideChange) {
      onSlideChange(newIndex);
    } else {
      setInternalCurrentIndex(newIndex);
    }
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
  const slideWidth = reduceSize ? containerWidth * 0.8 : containerWidth;
  const slideMargin = reduceSize ? containerWidth * 0.1 : 0;
  
  return (
    <div 
      className={cn('relative overflow-hidden w-full', className)} 
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
            ? dragOffset - (currentIndex * slideWidth)
            : -(currentIndex * slideWidth)
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3 
        }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div 
            className="flex-shrink-0"
            style={{ 
              width: slideWidth, 
              marginLeft: index === 0 ? 0 : slideMargin,
              marginRight: index === children.length - 1 ? 0 : slideMargin,
              touchAction: 'none'
            }}
            key={index}
            initial={{ opacity: 0.5, scale: 0.9 }}
            animate={{ 
              opacity: currentIndex === index ? 1 : 0.7,
              scale: currentIndex === index ? 1 : 0.9
            }}
            transition={{ duration: 0.3 }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
      
      {/* Indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {children.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex ? "bg-primary" : "bg-muted"
            )}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeableCarousel;
