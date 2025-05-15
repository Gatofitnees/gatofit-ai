
import React from "react";
import { motion } from "framer-motion";
import { useWheelItemAnimation } from "./hooks/useWheelItemAnimation";
import { getWheelItemContainerStyles, getWheelItemLabelStyles } from "./styles/wheelItemStyles";

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
  // Extract animation logic to custom hook
  const {
    opacity,
    scale,
    translateY,
    zIndex,
    isSelected,
    transition
  } = useWheelItemAnimation({
    index,
    selectedIndex,
    offset,
    itemHeight,
    wheelHeight,
    halfVisibleItems,
    isAnimating
  });
  
  // Get computed class names from style helpers
  const containerClassName = getWheelItemContainerStyles(isSelected);
  const labelStyles = getWheelItemLabelStyles(labelClassName);
  
  return (
    <motion.div
      className={containerClassName}
      style={{ 
        height: `${itemHeight}px`,
        top: 0,
        zIndex,
      }}
      animate={{ 
        y: translateY,
        opacity,
        scale,
      }}
      transition={transition}
      onClick={() => onClick(index)}
    >
      <span className={labelStyles}>
        {label}
      </span>
    </motion.div>
  );
};

export default WheelItem;
