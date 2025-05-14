
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const currentTranslateY = useRef(0);
  const touchId = useRef<number | null>(null);

  // Safety check to ensure values array is not empty
  if (!values || values.length === 0) {
    console.error("WheelSelector: values array is empty or undefined");
    return <div className="p-4 text-muted-foreground">No values provided</div>;
  }

  // Find initial selected index if initialValue is provided
  useEffect(() => {
    if (initialValue !== undefined && values && values.length > 0) {
      const index = values.findIndex(item => item.value === initialValue);
      setSelectedIndex(index !== -1 ? index : 0);
    }
  }, [initialValue, values]);

  // Notify parent component when selection changes
  useEffect(() => {
    if (values && values.length > 0 && selectedIndex >= 0 && selectedIndex < values.length) {
      onChange(values[selectedIndex].value);
    }
  }, [selectedIndex, onChange, values]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchId.current !== null) return;
    
    const touch = e.touches[0];
    touchId.current = touch.identifier;
    isDragging.current = true;
    startY.current = touch.clientY;
    currentTranslateY.current = 0;
    document.body.style.overflow = "hidden"; // Prevent scrolling
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDragging.current) return;
    
    isDragging.current = true;
    startY.current = e.clientY;
    currentTranslateY.current = 0;
    document.body.style.overflow = "hidden"; // Prevent scrolling
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    // Find the relevant touch
    let touchIndex = -1;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === touchId.current) {
        touchIndex = i;
        break;
      }
    }
    
    if (touchIndex === -1) return;
    
    const currentY = e.touches[touchIndex].clientY;
    const diffY = currentY - startY.current;
    currentTranslateY.current = diffY;
    
    const newIndex = calculateNewIndex(diffY);
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const currentY = e.clientY;
    const diffY = currentY - startY.current;
    currentTranslateY.current = diffY;
    
    const newIndex = calculateNewIndex(diffY);
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Check if this is the end of our tracked touch
    let found = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        found = true;
        break;
      }
    }
    
    if (found) {
      isDragging.current = false;
      touchId.current = null;
      document.body.style.overflow = ""; // Re-enable scrolling
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
    document.body.style.overflow = ""; // Re-enable scrolling
  };

  const calculateNewIndex = (diffY: number) => {
    const indexChange = Math.round(diffY / itemHeight);
    let newIndex = Math.max(0, Math.min(values.length - 1, selectedIndex - indexChange));
    return newIndex;
  };

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
  };

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
        {values.map((item, index) => {
          const distance = index - selectedIndex;
          const visible = Math.abs(distance) <= halfVisibleItems;
          
          if (!visible) return null;
          
          const opacity = 1 - Math.min(1, Math.abs(distance) / (halfVisibleItems + 1));
          const scale = 1 - Math.min(0.3, Math.abs(distance) / (halfVisibleItems + 1) * 0.3);
          const translateY = (index - selectedIndex) * itemHeight + (wheelHeight / 2 - itemHeight / 2);
          
          return (
            <motion.div
              key={`${index}-${item.value}`}
              className={cn(
                "absolute left-0 w-full flex items-center justify-center cursor-pointer transition-colors",
                distance === 0 ? "text-primary font-medium" : "text-muted-foreground"
              )}
              style={{ 
                height: `${itemHeight}px`,
                top: 0,
                y: translateY,
                opacity,
                scale,
                zIndex: 100 - Math.abs(distance)
              }}
              initial={false}
              onClick={() => handleItemClick(index)}
            >
              <span className={cn("select-none text-center truncate px-2", labelClassName)}>
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WheelSelector;
