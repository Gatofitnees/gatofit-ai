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
  const [scrollOffset, setScrollOffset] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs for animation and interaction tracking
  const lastY = useRef(0);
  const lastTime = useRef(Date.now());
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const velocityTracker = useRef<Array<{time: number, position: number}>>([]);
  const selectedIndexRef = useRef(selectedIndex);

  // Track selected index in a ref to avoid closure issues in animations
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // Notify parent component when selection changes
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
        cancelAnimation();
        setScrollOffset(0);
      }
    }
  }, [initialValue, values, selectedIndex]);

  // Clean up any animations when component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Helper function to cancel current animation
  const cancelAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  // Process new position and calculate velocity
  const processMovement = useCallback((clientY: number, time: number) => {
    // Calculate new position
    const delta = clientY - startY;
    
    // Update velocity tracker (keep last 5 points for better accuracy)
    velocityTracker.current.push({ time, position: clientY });
    if (velocityTracker.current.length > 5) {
      velocityTracker.current.shift();
    }
    
    // Calculate velocity based on recent movements
    if (velocityTracker.current.length >= 2) {
      const newest = velocityTracker.current[velocityTracker.current.length - 1];
      const oldest = velocityTracker.current[0];
      
      const timeDelta = newest.time - oldest.time;
      if (timeDelta > 0) {
        const posDelta = newest.position - oldest.position;
        // Scale factor to make velocity feel natural
        const newVelocity = (posDelta / timeDelta) * 12; 
        setScrollVelocity(newVelocity);
      }
    }
    
    // Calculate how much the wheel should move
    const sensitivity = 0.6; // Lower = less sensitive
    const offset = delta * sensitivity;
    
    // Calculate theoretical new index based on offset
    const rawIndexChange = offset / itemHeight;
    
    // Calculate potential new index
    const newIndex = Math.max(
      0, 
      Math.min(
        values.length - 1, 
        Math.round(initialSelectedIndex - rawIndexChange)
      )
    );
    
    // Update scroll offset to reflect partial movement between indices
    const fractionalPart = rawIndexChange % 1;
    setScrollOffset(fractionalPart * itemHeight);
    
    // Update selected index if changed
    if (newIndex !== selectedIndexRef.current) {
      setSelectedIndex(newIndex);
    }
  }, [startY, initialSelectedIndex, values.length, itemHeight]);

  // Handle interaction start
  const handleStart = useCallback((clientY: number) => {
    // Cancel any ongoing animation
    cancelAnimation();
    
    // Reset velocity tracking and start position
    velocityTracker.current = [];
    setIsDragging(true);
    setStartY(clientY);
    lastY.current = clientY;
    lastTime.current = Date.now();
    setScrollVelocity(0);
    setScrollOffset(0);
  }, [cancelAnimation]);

  // Handle interaction move
  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return;
    
    const now = Date.now();
    processMovement(clientY, now);
    
    lastY.current = clientY;
    lastTime.current = now;
  }, [isDragging, processMovement]);

  // Apply momentum animation after user stops interaction
  const applyMomentum = useCallback(() => {
    if (Math.abs(scrollVelocity) < 0.1) {
      snapToClosest();
      return;
    }
    
    setIsAnimating(true);
    
    let velocity = scrollVelocity;
    let offset = scrollOffset;
    let lastTimestamp = performance.now();
    let accumulatedChange = 0;
    
    const animateMomentum = (timestamp: number) => {
      // Time since last frame
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Apply friction to slow down the movement
      velocity *= 0.95;
      
      // Calculate position change
      const change = velocity * (deltaTime / 16.67); // Normalize to 60fps
      offset += change;
      accumulatedChange += change;
      
      // Update scroll offset for visual feedback
      setScrollOffset(offset);
      
      // Check if we've moved enough to change the index
      const indexChange = Math.floor(Math.abs(accumulatedChange) / itemHeight) * Math.sign(accumulatedChange);
      
      if (indexChange !== 0) {
        // Update selected index and reset accumulated change
        const newIndex = Math.max(0, Math.min(values.length - 1, selectedIndexRef.current - indexChange));
        
        if (newIndex !== selectedIndexRef.current) {
          setSelectedIndex(newIndex);
          accumulatedChange -= indexChange * itemHeight;
        }
      }
      
      // Continue animation if velocity is significant, otherwise snap
      if (Math.abs(velocity) > 0.1) {
        animationRef.current = requestAnimationFrame(animateMomentum);
      } else {
        snapToClosest();
      }
    };
    
    animationRef.current = requestAnimationFrame(animateMomentum);
  }, [scrollVelocity, scrollOffset, itemHeight, values.length]);

  // Snap to the closest index with animation
  const snapToClosest = useCallback(() => {
    setIsAnimating(true);
    
    const targetOffset = 0;
    const startOffset = scrollOffset;
    const distance = targetOffset - startOffset;
    const startTime = performance.now();
    const duration = 300; // Animation duration in ms
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuint(progress);
      
      const newOffset = startOffset + distance * easedProgress;
      setScrollOffset(newOffset);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setScrollOffset(0);
        setIsAnimating(false);
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [scrollOffset]);

  // Handle interaction end
  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Apply momentum if there's velocity, otherwise snap to closest
    if (Math.abs(scrollVelocity) > 0.5) {
      applyMomentum();
    } else {
      snapToClosest();
    }
  }, [isDragging, scrollVelocity, applyMomentum, snapToClosest]);

  // Handle item click
  const handleItemClick = useCallback((index: number) => {
    if (isAnimating || index === selectedIndex) return;
    
    cancelAnimation();
    setIsAnimating(true);
    setSelectedIndex(index);
    setScrollOffset(0);
    
    // Brief animation for visual feedback
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, selectedIndex, cancelAnimation]);

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
      onMouseLeave={handleEnd}
    >
      {/* Center highlight */}
      <div className="absolute left-0 top-1/2 w-full h-[40px] -translate-y-1/2 bg-primary/10 pointer-events-none z-10"></div>
      
      {/* Items */}
      <div className="absolute left-0 w-full transform">
        {values.map((item, index) => (
          <WheelItem
            key={`${index}-${item.value}`}
            label={item.label}
            index={index}
            selectedIndex={selectedIndex}
            scrollOffset={scrollOffset}
            itemHeight={itemHeight}
            wheelHeight={wheelHeight}
            halfVisibleItems={halfVisibleItems}
            onClick={handleItemClick}
            labelClassName={labelClassName}
            isAnimating={isAnimating}
          />
        ))}
      </div>
    </div>
  );
};

export default WheelSelector;
