
import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import WheelItem from "./WheelItem";
import { easeOutCubic, easeOutQuint } from "./easingFunctions";

interface WheelSelectorProps {
  values: Array<{ label: string; value: any }>;
  onChange: (value: any) => void;
  initialValue?: any;
  itemHeight?: number;
  visibleItems?: number;
  className?: string;
  labelClassName?: string;
}

const WheelSelector: React.FC<WheelSelectorProps> = ({
  values,
  onChange,
  initialValue,
  itemHeight = 40,
  visibleItems = 5,
  className,
  labelClassName,
}) => {
  // Safety check to ensure values array is not empty
  if (!values || values.length === 0) {
    console.error("WheelSelector: values array is empty or undefined");
    return <div className="p-4 text-muted-foreground">No values provided</div>;
  }

  // Find initial selected index if initialValue is provided
  const initialSelectedIndex = initialValue !== undefined && values && values.length > 0
    ? values.findIndex(item => item.value === initialValue)
    : 0;

  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex !== -1 ? initialSelectedIndex : 0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [offset, setOffset] = useState(0);
  const [momentum, setMomentum] = useState(0);
  
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const selectedIndexRef = useRef(selectedIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update ref when selectedIndex changes
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // Notify parent component of value changes
  useEffect(() => {
    if (values && values.length > 0 && selectedIndex >= 0 && selectedIndex < values.length) {
      onChange(values[selectedIndex].value);
    }
  }, [selectedIndex, onChange, values]);

  // Update selectedIndex if initialValue changes
  useEffect(() => {
    if (initialValue !== undefined && values && values.length > 0) {
      const index = values.findIndex(item => item.value === initialValue);
      if (index !== -1 && index !== selectedIndex) {
        setSelectedIndex(index);
        cancelAnimationFrame();
        setOffset(0);
      }
    }
  }, [initialValue, values, selectedIndex]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Helper function to cancel any ongoing animations
  const cancelAnimationFrame = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  // Smoothly snap to the closest item
  const snapToClosest = useCallback(() => {
    cancelAnimationFrame();
    setIsAnimating(true);

    // Round offset to closest item
    const targetOffset = 0; // Always snap to center (zero offset)
    const startOffset = offset;
    const distance = targetOffset - startOffset;
    const duration = 300; // ms
    const startTime = performance.now();

    const animateSnap = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuint(progress); // Smoother easing
      
      const currentOffset = startOffset + (distance * easedProgress);
      setOffset(currentOffset);
      
      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateSnap);
      } else {
        setOffset(0); // Ensure we end at exactly 0 offset
        setIsAnimating(false);
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = window.requestAnimationFrame(animateSnap);
  }, [offset, cancelAnimationFrame]);

  // Handle start of interaction (touch/mouse down)
  const handleStart = useCallback((clientY: number) => {
    cancelAnimationFrame();
    setIsDragging(true);
    lastY.current = clientY;
    lastTime.current = performance.now();
    setMomentum(0);
  }, [cancelAnimationFrame]);

  // Handle movement during interaction
  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const now = performance.now();
    const deltaY = clientY - lastY.current;
    const deltaTime = now - lastTime.current;
    
    // Calculate instantaneous velocity (with direction)
    if (deltaTime > 0) {
      const velocity = deltaY / deltaTime * 10; // Scale for better feel
      setMomentum(velocity);
    }
    
    // Calculate new offset and limit it
    const sensitivity = 0.5; // Lower number = less sensitive
    const newOffset = offset + (deltaY * sensitivity);
    
    // Calculate index change based on offset
    const indexChange = Math.floor(Math.abs(newOffset) / itemHeight) * Math.sign(newOffset);
    
    if (indexChange !== 0) {
      // Update selected index
      const newIndex = Math.max(
        0, 
        Math.min(
          values.length - 1, 
          selectedIndexRef.current - indexChange
        )
      );
      
      if (newIndex !== selectedIndexRef.current) {
        setSelectedIndex(newIndex);
        setOffset(newOffset - (indexChange * itemHeight)); // Adjust offset
      }
    } else {
      setOffset(newOffset);
    }
    
    lastY.current = clientY;
    lastTime.current = now;
  }, [isDragging, offset, itemHeight, values.length]);

  // Handle end of interaction
  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Apply momentum if significant, otherwise snap
    if (Math.abs(momentum) > 0.5) {
      applyMomentum();
    } else {
      snapToClosest();
    }
  }, [isDragging, momentum, snapToClosest]);

  // Apply momentum animation after interaction ends
  const applyMomentum = useCallback(() => {
    cancelAnimationFrame();
    setIsAnimating(true);
    
    let currentMomentum = momentum;
    let currentOffset = offset;
    let previousTime = performance.now();
    let accumulatedOffset = 0;
    
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - previousTime;
      previousTime = timestamp;
      
      // Apply friction to gradually reduce momentum
      currentMomentum *= 0.95;
      
      // Apply momentum to offset
      const change = currentMomentum * (deltaTime / 16); // Normalize to ~60fps
      currentOffset += change;
      accumulatedOffset += change;
      
      // Check if we've accumulated enough offset to change the index
      const indexChange = Math.floor(Math.abs(accumulatedOffset) / itemHeight) * Math.sign(accumulatedOffset);
      
      if (indexChange !== 0) {
        // Update selected index
        const newIndex = Math.max(0, Math.min(values.length - 1, selectedIndexRef.current - indexChange));
        
        if (newIndex !== selectedIndexRef.current) {
          setSelectedIndex(newIndex);
          accumulatedOffset -= (indexChange * itemHeight);
        }
      }
      
      setOffset(currentOffset - (Math.floor(currentOffset / itemHeight) * itemHeight));
      
      // Continue animation or end it
      if (Math.abs(currentMomentum) > 0.1) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        snapToClosest();
      }
    };
    
    animationFrameRef.current = window.requestAnimationFrame(animate);
  }, [momentum, offset, itemHeight, values.length, cancelAnimationFrame, snapToClosest]);

  // Handle click on a specific item
  const handleItemClick = useCallback((index: number) => {
    if (index === selectedIndex || isAnimating) return;
    
    cancelAnimationFrame();
    setIsAnimating(true);
    
    // Animate to the target index
    const startIndex = selectedIndex;
    const targetIndex = index;
    const distance = targetIndex - startIndex;
    const duration = 300; // ms
    const startTime = performance.now();
    
    const animateToIndex = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const currentIndex = startIndex + (distance * easedProgress);
      const newIndex = Math.round(currentIndex);
      
      if (newIndex !== selectedIndexRef.current) {
        setSelectedIndex(newIndex);
      }
      
      // Calculate fractional offset for smooth animation
      const fractionalPart = currentIndex - Math.floor(currentIndex);
      setOffset(-fractionalPart * itemHeight);
      
      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateToIndex);
      } else {
        setOffset(0);
        setSelectedIndex(targetIndex);
        setIsAnimating(false);
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = window.requestAnimationFrame(animateToIndex);
  }, [selectedIndex, isAnimating, itemHeight, cancelAnimationFrame]);

  const wheelHeight = itemHeight * visibleItems;
  const halfVisibleItems = Math.floor(visibleItems / 2);

  return (
    <div 
      className={cn("relative overflow-hidden rounded-xl bg-secondary/20 shadow-neu-card", className)}
      style={{ height: `${wheelHeight}px`, width: "100%" }}
      ref={containerRef}
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={(e) => handleStart(e.clientY)}
      onMouseMove={(e) => isDragging && handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={() => isDragging && handleEnd()}
    >
      {/* Center highlight */}
      <div className="absolute left-0 top-1/2 w-full h-[40px] -translate-y-1/2 bg-primary/10 pointer-events-none z-10" />
      
      {/* Items */}
      <div className="absolute left-0 w-full transform">
        {values.map((item, index) => {
          // Calculate distance from selected item
          const distance = index - selectedIndex;
          
          // Only render items that are visible or about to become visible
          if (Math.abs(distance) > halfVisibleItems + 1) return null;
          
          return (
            <WheelItem
              key={`${index}-${item.value}`}
              label={item.label}
              index={index}
              selectedIndex={selectedIndex}
              offset={offset}
              itemHeight={itemHeight}
              wheelHeight={wheelHeight}
              halfVisibleItems={halfVisibleItems}
              onClick={handleItemClick}
              labelClassName={labelClassName}
              isAnimating={isAnimating}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WheelSelector;
