
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeableCarouselProps {
  children: React.ReactNode[];
  className?: string;
  reduceSize?: boolean;
}

const SwipeableCarousel: React.FC<SwipeableCarouselProps> = ({ children, className, reduceSize = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
      setCurrentIndex(currentIndex - 1);
    } else if (dragOffset < -threshold && currentIndex < children.length - 1) {
      // Swipe left - go to next
      setCurrentIndex(currentIndex + 1);
    }
    
    setIsDragging(false);
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

  // Show hint of previous/next items
  const peekSize = reduceSize ? 20 : 0; // Show a peek of the next/previous items
  
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
        style={{ 
          x: isDragging 
            ? dragOffset - (currentIndex * (getItemWidth() - peekSize))
            : -(currentIndex * (getItemWidth() - peekSize)),
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div 
            className={cn(
              "flex-shrink-0",
              reduceSize ? "w-[90%] mx-[5%]" : "w-full"
            )}
            style={{ touchAction: 'none' }}
            key={index}
          >
            {child}
          </div>
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
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeableCarousel;
