
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import WheelItem from "./WheelItem";
import { useWheelInteraction } from "./useWheelInteraction";

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Safety check to ensure values array is not empty
  if (!values || values.length === 0) {
    console.error("WheelSelector: values array is empty or undefined");
    return <div className="p-4 text-muted-foreground">No values provided</div>;
  }

  // Find initial selected index if initialValue is provided
  const initialSelectedIndex = initialValue !== undefined && values && values.length > 0
    ? values.findIndex(item => item.value === initialValue)
    : 0;
  
  const initialIndex = initialSelectedIndex !== -1 ? initialSelectedIndex : 0;

  const {
    selectedIndex,
    setSelectedIndex,
    handleTouchStart,
    handleMouseDown,
    handleTouchMove,
    handleMouseMove,
    handleTouchEnd,
    handleEnd,
    handleItemClick
  } = useWheelInteraction({
    itemHeight,
    values,
    onChange,
    initialSelectedIndex: initialIndex
  });

  // Notify parent component when selection changes
  useEffect(() => {
    if (values && values.length > 0 && selectedIndex >= 0 && selectedIndex < values.length) {
      onChange(values[selectedIndex].value);
    }
  }, [selectedIndex, onChange, values]);

  // Find initial selected index if initialValue is provided and update when it changes
  useEffect(() => {
    if (initialValue !== undefined && values && values.length > 0) {
      const index = values.findIndex(item => item.value === initialValue);
      setSelectedIndex(index !== -1 ? index : 0);
    }
  }, [initialValue, values, setSelectedIndex]);

  const wheelHeight = itemHeight * visibleItems;
  const halfVisibleItems = Math.floor(visibleItems / 2);

  return (
    <div 
      className={cn("relative overflow-hidden rounded-xl bg-secondary/20 shadow-neu-card", className)}
      style={{ height: `${wheelHeight}px`, width: "100%" }}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Center highlight */}
      <div className="absolute left-0 top-1/2 w-full h-[40px] -translate-y-1/2 bg-primary/10 pointer-events-none z-10"></div>
      
      {/* Items */}
      <div className="absolute left-0 w-full transform">
        {values.map((item, index) => (
          <WheelItem
            key={`${index}-${item.value}`}
            label={item.label}
            index={index}
            selectedIndex={selectedIndex}
            itemHeight={itemHeight}
            wheelHeight={wheelHeight}
            halfVisibleItems={halfVisibleItems}
            onClick={handleItemClick}
            labelClassName={labelClassName}
          />
        ))}
      </div>
    </div>
  );
};

export default WheelSelector;
