
import React, { useState, useRef, useEffect, useCallback } from "react";
import { getWheelContainerStyles } from "./styles/wheelItemStyles";
import WheelItem from "./WheelItem";
import WheelHighlight from "./WheelHighlight";

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

  const [selectedIndex, setSelectedIndex] = useState(getInitialIndex);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const startYRef = useRef(0);
  const lastYRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Update selected index if initialValue changes
  useEffect(() => {
    if (initialValue !== undefined) {
      const index = values.findIndex(item => item.value === initialValue);
      if (index !== -1 && index !== selectedIndex) {
        setSelectedIndex(index);
        setOffset(0);
      }
    }
  }, [initialValue, values, selectedIndex]);

  // Handle item click
  const handleItemClick = useCallback((index: number) => {
    if (index === selectedIndex) return;
    
    setSelectedIndex(index);
    setOffset(0);
    onChange(values[index].value);
  }, [selectedIndex, onChange, values]);

  // Reset offset to 0 when it's large enough to change the selection
  useEffect(() => {
    if (Math.abs(offset) >= itemHeight / 2) {
      const indexChange = Math.sign(offset) * -1; // Reverse direction for natural feel
      const newIndex = Math.max(0, Math.min(values.length - 1, selectedIndex + indexChange));
      
      if (newIndex !== selectedIndex) {
        setSelectedIndex(newIndex);
        onChange(values[newIndex].value);
      }
      
      setOffset(0);
    }
  }, [offset, itemHeight, selectedIndex, values, onChange]);

  // Handle touch/mouse start
  const handleStart = useCallback((clientY: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setIsDragging(true);
    startYRef.current = clientY;
    lastYRef.current = clientY;
  }, []);

  // Handle touch/mouse move
  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return;
    
    const delta = clientY - lastYRef.current;
    lastYRef.current = clientY;
    
    // Update offset with some resistance for better feel
    setOffset(prevOffset => {
      const newOffset = prevOffset + delta * 0.8;
      
      // Add resistance at ends
      if ((selectedIndex === 0 && newOffset > 0) || 
          (selectedIndex === values.length - 1 && newOffset < 0)) {
        return prevOffset + delta * 0.3;
      }
      
      return newOffset;
    });
  }, [isDragging, selectedIndex, values.length]);

  // Handle touch/mouse end
  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Snap back to center with animation
    const snapBack = () => {
      setOffset(prevOffset => {
        if (Math.abs(prevOffset) < 1) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          return 0;
        }
        
        const newOffset = prevOffset * 0.8;
        animationRef.current = requestAnimationFrame(snapBack);
        return newOffset;
      });
    };
    
    animationRef.current = requestAnimationFrame(snapBack);
  }, [isDragging]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
