
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WheelItemProps {
  label: string;
  index: number;
  selectedIndex: number;
  scrollOffset?: number;
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
  scrollOffset = 0,
  itemHeight,
  wheelHeight,
  halfVisibleItems,
  onClick,
  labelClassName,
  isAnimating = false
}) => {
  const distance = index - selectedIndex;
  const visible = Math.abs(distance) <= halfVisibleItems + 1; // +1 to render one more item for smooth scrolling
  
  if (!visible) return null;
  
  // Calculate opacity and scale based on distance from center
  const distanceRatio = Math.min(1, Math.abs(distance) / (halfVisibleItems + 1));
  const opacity = 1 - distanceRatio * 0.75;
  const scale = 1 - distanceRatio * 0.2;
  
  // Calculate vertical position with scroll offset for smooth animation
  const translateY = (distance * itemHeight) - scrollOffset + (wheelHeight / 2 - itemHeight / 2);
  
  // Determine if this is the selected item
  const isSelected = distance === 0;
  
  return (
    <motion.div
      key={`${index}-${label}`}
      className={cn(
        "absolute left-0 w-full flex items-center justify-center cursor-pointer transition-colors",
        isSelected ? "text-primary font-medium" : "text-muted-foreground"
      )}
      style={{ 
        height: `${itemHeight}px`,
        top: 0,
        zIndex: 100 - Math.abs(distance)
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
