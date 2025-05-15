
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WheelItemProps {
  label: string;
  index: number;
  selectedIndex: number;
  offset?: number;
  itemHeight: number;
  wheelHeight: number;
  halfVisibleItems: number;
  onClick: (index: number) => void;
  labelClassName?: string;
  isAnimating?: boolean;
}

const WheelItem: React.FC<WheelItemProps> = ({
  label,
  index,
  selectedIndex,
  offset = 0,
  itemHeight,
  wheelHeight,
  halfVisibleItems,
  onClick,
  labelClassName,
  isAnimating = false
}) => {
  const distance = index - selectedIndex;
  
  // Calculate opacity and scale based on distance from center
  const absDistance = Math.abs(distance);
  const distanceRatio = Math.min(1, absDistance / (halfVisibleItems + 0.5));
  const opacity = 1 - distanceRatio * 0.75;
  const scale = 1 - distanceRatio * 0.2;
  
  // Calculate vertical position with offset for smooth animation
  const translateY = (distance * itemHeight) + offset + (wheelHeight / 2 - itemHeight / 2);
  
  return (
    <motion.div
      className={cn(
        "absolute left-0 w-full flex items-center justify-center cursor-pointer transition-colors",
        distance === 0 ? "text-primary font-medium" : "text-muted-foreground"
      )}
      style={{ 
        height: `${itemHeight}px`,
        top: 0,
        zIndex: 100 - absDistance,
      }}
      animate={{ 
        y: translateY,
        opacity,
        scale,
      }}
      transition={{ 
        type: isAnimating ? "spring" : "tween",
        stiffness: isAnimating ? 300 : 400,
        damping: isAnimating ? 30 : 40,
        duration: isAnimating ? 0.3 : 0.15
      }}
      onClick={() => onClick(index)}
    >
      <span className={cn("select-none text-center truncate px-2", labelClassName)}>
        {label}
      </span>
    </motion.div>
  );
};

export default WheelItem;
