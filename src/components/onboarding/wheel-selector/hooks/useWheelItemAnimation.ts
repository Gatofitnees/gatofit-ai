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
    
    // Calculate visual properties based on distance
    const distanceRatio = Math.min(1, absDistance / (halfVisibleItems + 0.5));
    const opacity = 1 - distanceRatio * 0.8; // Slightly increased opacity fade for better readability
    const scale = 1 - distanceRatio * 0.25; // Slightly increased scale effect for better distinction
    
    // Position calculation with smooth offset
    const translateY = (distance * itemHeight) + offset + (wheelHeight / 2 - itemHeight / 2);
    
    // Determine z-index to keep selected item on top
    const zIndex = 100 - absDistance;
    
    // Determine text styles based on selection state
    const isSelected = distance === 0;
    
    // Animation properties
    const transition = {
      type: isAnimating ? "spring" : "tween",
      stiffness: isAnimating ? 350 : 400, // Increased stiffness for snappier animations
      damping: isAnimating ? 35 : 40, // Adjusted damping for smoother motion
      duration: isAnimating ? 0.3 : 0.15
    };
    
    return {
      distance,
      absDistance,
      opacity,
      scale,
      translateY,
      zIndex,
      isSelected,
      transition
    };
  }, [index, selectedIndex, offset, itemHeight, wheelHeight, halfVisibleItems, isAnimating]);
};
