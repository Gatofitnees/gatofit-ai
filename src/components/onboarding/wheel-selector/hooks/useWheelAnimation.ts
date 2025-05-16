
import { useRef, useState, useCallback, MutableRefObject } from "react";
import { easeOutCubic, easeOutQuint } from "../easingFunctions";

interface UseWheelAnimationProps {
  itemHeight: number;
  valuesLength: number;
  initialSelectedIndex: number;
  onChange: (index: number) => void;
}

export const useWheelAnimation = ({
  itemHeight,
  valuesLength,
  initialSelectedIndex,
  onChange,
}: UseWheelAnimationProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [offset, setOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const selectedIndexRef = useRef(selectedIndex);
  const animationFrameRef = useRef<number | null>(null);
  
  // Update ref when selectedIndex changes
  const updateSelectedIndexRef = useCallback((index: number) => {
    selectedIndexRef.current = index;
    setSelectedIndex(index);
    onChange(index);
  }, [onChange]);
  
  // Helper function to cancel any ongoing animations
  const cancelAnimationFrame = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsAnimating(false);
  }, []);
  
  // Clean up animation on unmount
  const cleanupAnimation = useCallback(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
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
  
  // Handle click on a specific item
  const handleItemClick = useCallback((index: number) => {
    if (index === selectedIndexRef.current || isAnimating) return;
    
    cancelAnimationFrame();
    setIsAnimating(true);
    
    // Animate to the target index
    const startIndex = selectedIndexRef.current;
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
        updateSelectedIndexRef(newIndex);
      }
      
      // Calculate fractional offset for smooth animation
      const fractionalPart = currentIndex - Math.floor(currentIndex);
      setOffset(-fractionalPart * itemHeight);
      
      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateToIndex);
      } else {
        setOffset(0);
        updateSelectedIndexRef(targetIndex);
        setIsAnimating(false);
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = window.requestAnimationFrame(animateToIndex);
  }, [isAnimating, itemHeight, cancelAnimationFrame, updateSelectedIndexRef]);
  
  // Apply momentum animation after interaction ends - enhanced for more natural feeling
  const applyMomentum = useCallback((
    momentum: number, 
    currentOffset: number
  ) => {
    cancelAnimationFrame();
    setIsAnimating(true);
    
    // Increase initial momentum for more pronounced effect
    let currentMomentum = momentum * 1.5; // Amplify initial momentum
    let offset = currentOffset;
    let previousTime = performance.now();
    let accumulatedOffset = 0;
    
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - previousTime;
      previousTime = timestamp;
      
      // Apply friction to gradually reduce momentum
      // Lower value = more inercia (slower decay)
      currentMomentum *= 0.92; 
      
      // Apply momentum to offset
      const change = currentMomentum * (deltaTime / 16); // Normalize to ~60fps
      offset += change;
      accumulatedOffset += change;
      
      // Check if we've accumulated enough offset to change the index
      const indexChange = Math.floor(Math.abs(accumulatedOffset) / itemHeight) * Math.sign(accumulatedOffset);
      
      if (indexChange !== 0) {
        // Update selected index
        const newIndex = Math.max(0, Math.min(valuesLength - 1, selectedIndexRef.current - indexChange));
        
        if (newIndex !== selectedIndexRef.current) {
          updateSelectedIndexRef(newIndex);
          accumulatedOffset -= (indexChange * itemHeight);
        }
      }
      
      setOffset(offset - (Math.floor(offset / itemHeight) * itemHeight));
      
      // Continue animation or end it
      if (Math.abs(currentMomentum) > 0.05) { // Lower threshold for longer animation
        animationFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        snapToClosest();
      }
    };
    
    animationFrameRef.current = window.requestAnimationFrame(animate);
  }, [itemHeight, valuesLength, cancelAnimationFrame, snapToClosest, updateSelectedIndexRef]);
  
  return {
    selectedIndex,
    offset,
    isAnimating,
    animationFrameRef,
    selectedIndexRef,
    setOffset,
    setIsAnimating,
    updateSelectedIndexRef,
    cancelAnimationFrame,
    cleanupAnimation,
    snapToClosest,
    handleItemClick,
    applyMomentum
  };
};
