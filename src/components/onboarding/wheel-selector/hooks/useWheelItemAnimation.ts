
import { useMemo } from "react";
import { easeOutCubic } from "../easingFunctions";

interface WheelItemAnimationProps {
  index: number;
  selectedIndex: number;
  offset: number;
  itemHeight: number;
  wheelHeight: number;
  halfVisibleItems: number;
  isAnimating?: boolean;
}

export const useWheelItemAnimation = ({
  index,
  selectedIndex,
  offset,
  itemHeight,
  wheelHeight,
  halfVisibleItems,
  isAnimating = false
}: WheelItemAnimationProps) => {
  return useMemo(() => {
    // Calculate distance from center item
    const distance = index - selectedIndex;
    const absDistance = Math.abs(distance);
    
    // Enhanced visual properties based on distance for 3D effect
    const distanceRatio = Math.min(1, absDistance / (halfVisibleItems + 0.5));
    
    // Improved opacity curve for better readability
    const opacity = 1 - Math.pow(distanceRatio, 1.5) * 0.8;
    
    // Enhanced 3D-like scaling effect
    const scale = 1 - distanceRatio * 0.3;
    
    // Smoother position calculation with enhanced offset
    const translateY = (distance * itemHeight) + offset + (wheelHeight / 2 - itemHeight / 2);
    
    // Improved z-index calculation for proper layering
    const zIndex = 100 - Math.round(absDistance * 10);
    
    // Determine selection state
    const isSelected = distance === 0;
    
    // Enhanced animation properties
    const transition = {
      type: isAnimating ? "spring" : "tween",
      stiffness: isAnimating ? 400 : 450, // Increased stiffness for snappier animations
      damping: isAnimating ? 40 : 42,     // Better damping for smoother stops
      duration: isAnimating ? 0.25 : 0.2  // Slightly faster animations
    };
    
    // Add subtle perspective transform
    const perspective = absDistance > 0 ? `perspective(350px) translateZ(${-Math.min(absDistance * 5, 30)}px)` : '';
    
    return {
      distance,
      absDistance,
      opacity,
      scale,
      translateY,
      zIndex,
      isSelected,
      transition,
      perspective
    };
  }, [index, selectedIndex, offset, itemHeight, wheelHeight, halfVisibleItems, isAnimating]);
};
