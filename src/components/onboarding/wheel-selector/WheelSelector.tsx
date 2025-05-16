
import React, { useState, useCallback, useEffect } from "react";
import { getWheelContainerStyles } from "./styles/wheelItemStyles";
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
  // Safety check
  if (!values || values.length === 0) {
    console.error("WheelSelector: values array is empty or undefined");
    return <div className="p-4 text-muted-foreground">No values provided</div>;
  }

  // Find initial selected index
  const getInitialIndex = () => {
    if (initialValue !== undefined) {
      const index = values.findIndex(item => item.value === initialValue);
      return index !== -1 ? index : 0;
    }
    return 0;
  };

  // Setup wheel animation hooks
  const {
    selectedIndex, 
    offset, 
    selectedIndexRef,
    setOffset,
    updateSelectedIndexRef,
    cancelAnimationFrame,
    snapToClosest,
    handleItemClick,
    applyMomentum,
    cleanupAnimation
  } = useWheelAnimation({
    itemHeight,
    valuesLength: values.length,
    initialSelectedIndex: getInitialIndex(),
    onChange: (index) => onChange(values[index].value),
  });
  
  // Setup wheel interaction hooks
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

  // Update selected index if initialValue changes
  useEffect(() => {
    if (initialValue !== undefined) {
      const index = values.findIndex(item => item.value === initialValue);
      if (index !== -1 && index !== selectedIndex) {
        updateSelectedIndexRef(index);
        setOffset(0);
      }
    }
  }, [initialValue, values, selectedIndex, updateSelectedIndexRef, setOffset]);
  
  // Cleanup animation on unmount
  useEffect(cleanupAnimation, [cleanupAnimation]);

  // Calculate wheel dimensions
  const wheelHeight = itemHeight * visibleItems;
  const halfVisibleItems = Math.floor(visibleItems / 2);
  
  // Get container styles
  const containerStyles = getWheelContainerStyles(className);

  // Prevent default on wheel to avoid page scroll
  const preventDefaultAndStop = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div 
      className={containerStyles}
      style={{ height: `${wheelHeight}px`, width: "100%" }}
      onTouchStart={(e) => {
        preventDefaultAndStop(e);
        handleStart(e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        preventDefaultAndStop(e);
        handleMove(e.touches[0].clientY);
      }}
      onTouchEnd={() => handleEnd()}
      onTouchCancel={() => handleEnd()}
      onMouseDown={(e) => {
        preventDefaultAndStop(e);
        handleStart(e.clientY);
      }}
      onMouseMove={(e) => isDragging && handleMove(e.clientY)}
      onMouseUp={() => handleEnd()}
      onMouseLeave={() => isDragging && handleEnd()}
    >
      {/* Center highlight */}
      <WheelHighlight itemHeight={itemHeight} />
      
      {/* Items */}
      <div className="relative h-full w-full">
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
              onClick={handleItemClick}
              labelClassName={labelClassName}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WheelSelector;
