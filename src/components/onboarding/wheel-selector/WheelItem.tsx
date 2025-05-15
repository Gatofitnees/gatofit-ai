
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WheelItemProps {
  label: string;
  index: number;
  selectedIndex: number;
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
  
  const opacity = 1 - Math.min(1, Math.abs(distance) / (halfVisibleItems + 1) * 0.8);
  const scale = 1 - Math.min(0.3, Math.abs(distance) / (halfVisibleItems + 1) * 0.25);
  const translateY = (index - selectedIndex) * itemHeight + (wheelHeight / 2 - itemHeight / 2);
  
  return (
    <motion.div
      key={`${index}-${label}`}
      className={cn(
        "absolute left-0 w-full flex items-center justify-center cursor-pointer transition-colors",
        distance === 0 ? "text-primary font-medium" : "text-muted-foreground"
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
        type: "spring", 
        stiffness: 280, 
        damping: 25,
        duration: isAnimating ? 0.3 : 0.1
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
