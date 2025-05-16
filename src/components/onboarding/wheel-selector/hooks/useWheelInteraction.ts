import { useRef, useState, useCallback } from "react";

interface UseWheelInteractionProps {
  selectedIndexRef: React.MutableRefObject<number>;
  itemHeight: number;
  offset: number;
  valuesLength: number;
  setOffset: (offset: number) => void;
  updateSelectedIndexRef: (index: number) => void;
  cancelAnimationFrame: () => void;
  snapToClosest: () => void;
  applyMomentum: (momentum: number, currentOffset: number) => void;
}

export const useWheelInteraction = ({
  selectedIndexRef,
  itemHeight,
  offset,
  valuesLength,
  setOffset,
  updateSelectedIndexRef,
  cancelAnimationFrame,
  snapToClosest,
  applyMomentum
}: UseWheelInteractionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [momentum, setMomentum] = useState(0);
  
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocityReadings = useRef<Array<number>>([]);
  
  // Handle start of interaction (touch/mouse down)
  const handleStart = useCallback((clientY: number) => {
    cancelAnimationFrame();
    setIsDragging(true);
    lastY.current = clientY;
    lastTime.current = performance.now();
    velocityReadings.current = [];
    setMomentum(0);
  }, [cancelAnimationFrame]);

  // Handle movement during interaction with improved momentum tracking
  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const now = performance.now();
    const deltaY = clientY - lastY.current;
    const deltaTime = now - lastTime.current;
    
    // Calculate instantaneous velocity (with direction)
    if (deltaTime > 0) {
      // Track last few velocity measurements for smoother momentum
      const velocity = deltaY / deltaTime * 12; // Increased sensitivity for better feel
      velocityReadings.current.push(velocity);
      
      // Keep only last 5 readings for momentum calculation
      if (velocityReadings.current.length > 5) {
        velocityReadings.current.shift();
      }
      
      // Calculate average velocity for smoother momentum
      const avgVelocity = velocityReadings.current.reduce((sum, v) => sum + v, 0) / 
                          velocityReadings.current.length;
      setMomentum(avgVelocity);
    }
    
    // Calculate new offset with improved sensitivity
    const sensitivity = 0.8; // Higher number = more sensitive
    const newOffset = offset + (deltaY * sensitivity);
    
    // Calculate index change based on offset
    const indexChange = Math.floor(Math.abs(newOffset) / itemHeight) * Math.sign(newOffset);
    
    if (indexChange !== 0) {
      // Update selected index with bounds checking
      const newIndex = Math.max(
        0, 
        Math.min(
          valuesLength - 1, 
          selectedIndexRef.current - indexChange
        )
      );
      
      if (newIndex !== selectedIndexRef.current) {
        updateSelectedIndexRef(newIndex);
        setOffset(newOffset - (indexChange * itemHeight)); // Adjust offset
      }
    } else {
      setOffset(newOffset);
    }
    
    lastY.current = clientY;
    lastTime.current = now;
  }, [isDragging, offset, itemHeight, valuesLength, selectedIndexRef, updateSelectedIndexRef, setOffset]);

  // Handle end of interaction with enhanced momentum effect
  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Apply momentum if significant, otherwise snap
    if (Math.abs(momentum) > 0.5) {
      // Apply momentum with the average of recent readings for smoother effect
      applyMomentum(momentum, offset);
    } else {
      snapToClosest();
    }
    
    // Clear velocity readings
    velocityReadings.current = [];
  }, [isDragging, momentum, offset, applyMomentum, snapToClosest]);

  return {
    isDragging,
    handleStart,
    handleMove,
    handleEnd
  };
};
