
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

  // Handle end of interaction
  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Apply momentum if significant, otherwise snap
    if (Math.abs(momentum) > 0.5) {
      applyMomentum(momentum, offset);
    } else {
      snapToClosest();
    }
  }, [isDragging, momentum, offset, applyMomentum, snapToClosest]);

  return {
    isDragging,
    handleStart,
    handleMove,
    handleEnd
  };
};
