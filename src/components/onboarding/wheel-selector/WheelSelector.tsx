
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import WheelItem from "./WheelItem";
import WheelHighlight from "./WheelHighlight";
import { useWheelAnimation } from "./hooks/useWheelAnimation";
import { useWheelInteraction } from "./hooks/useWheelInteraction";

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

  // Use the animation hook for handling wheel animations
  const {
    selectedIndex,
    offset,
    isAnimating,
    selectedIndexRef,
    setOffset,
    updateSelectedIndexRef,
    cancelAnimationFrame,
    cleanupAnimation,
    snapToClosest,
    handleItemClick,
    applyMomentum
  } = useWheelAnimation({
    itemHeight,
    valuesLength: values.length,
    initialSelectedIndex: initialSelectedIndex !== -1 ? initialSelectedIndex : 0,
    onChange: (index) => onChange(values[index].value)
  });

  // Use the interaction hook for handling user interactions
  const {
    isDragging,
    handleStart,
    handleMove,
    handleEnd
  } = useWheelInteraction({
    selectedIndexRef,
    itemHeight,
    offset,
    valuesLength: values.length,
    setOffset,
    updateSelectedIndexRef,
    cancelAnimationFrame,
    snapToClosest,
    applyMomentum
  });

  // Update selectedIndex if initialValue changes
  useEffect(() => {
    if (initialValue !== undefined && values && values.length > 0) {
      const index = values.findIndex(item => item.value === initialValue);
      if (index !== -1 && index !== selectedIndex) {
        updateSelectedIndexRef(index);
        cancelAnimationFrame();
        setOffset(0);
      }
    }
  }, [initialValue, values, selectedIndex, updateSelectedIndexRef, cancelAnimationFrame, setOffset]);

  // Cleanup animation on unmount
  useEffect(cleanupAnimation, [cleanupAnimation]);

  const wheelHeight = itemHeight * visibleItems;
  const halfVisibleItems = Math.floor(visibleItems / 2);

  return (
    <div 
      className={cn("relative overflow-hidden rounded-xl bg-secondary/20 shadow-neu-card", className)}
      style={{ height: `${wheelHeight}px`, width: "100%" }}
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={(e) => handleStart(e.clientY)}
      onMouseMove={(e) => isDragging && handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={() => isDragging && handleEnd()}
    >
      {/* Center highlight */}
      <WheelHighlight />
      
      {/* Items */}
      <div className="absolute left-0 w-full transform">
        {values.map((item, index) => {
          // Calculate distance from selected item
          const distance = index - selectedIndex;
          
          // Only render items that are visible or about to become visible
          if (Math.abs(distance) > halfVisibleItems + 1) return null;
          
          return (
            <WheelItem
              key={`${index}-${item.value}`}
              label={item.label}
              index={index}
              selectedIndex={selectedIndex}
              offset={offset}
              itemHeight={itemHeight}
              wheelHeight={wheelHeight}
              halfVisibleItems={halfVisibleItems}
              onClick={handleItemClick}
              labelClassName={labelClassName}
              isAnimating={isAnimating}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WheelSelector;
