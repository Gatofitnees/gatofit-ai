
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import WheelItem from "./WheelItem";

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

  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex !== -1 ? initialSelectedIndex : 0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastY = useRef(0);
  const lastTime = useRef(Date.now());
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Notify parent component when selection changes
  useEffect(() => {
    if (values && values.length > 0 && selectedIndex >= 0 && selectedIndex < values.length) {
      onChange(values[selectedIndex].value);
    }
  }, [selectedIndex, onChange, values]);

  // Update selectedIndex if initialValue changes
  useEffect(() => {
    if (initialValue !== undefined && values && values.length > 0) {
      const index = values.findIndex(item => item.value === initialValue);
      if (index !== -1 && index !== selectedIndex) {
        setSelectedIndex(index);
      }
    }
  }, [initialValue, values, selectedIndex]);

  const handleStart = (clientY: number) => {
    if (isAnimating && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
    }
    
    setIsDragging(true);
    setStartY(clientY);
    setCurrentY(clientY);
    lastY.current = clientY;
    lastTime.current = Date.now();
    setMomentum(0);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;

    // Calculate velocity for momentum
    const now = Date.now();
    const deltaTime = now - lastTime.current;
    
    if (deltaTime > 0) {
      const deltaY = clientY - lastY.current;
      const newMomentum = deltaY / deltaTime * 8; // Reduced sensitivity
      setMomentum(newMomentum);
    }
    
    lastY.current = clientY;
    lastTime.current = now;

    // Calculate movement and update index
    setCurrentY(clientY);
    const movement = clientY - startY;
    const indexChange = Math.round(movement / (itemHeight * 0.8)); // Reduced sensitivity
    
    const newIndex = Math.max(0, Math.min(values.length - 1, selectedIndex - indexChange));
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
      setStartY(clientY - (newIndex - selectedIndex) * itemHeight * 0.8); // Reset start position based on new index
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Apply momentum effect
    if (Math.abs(momentum) > 0.2) {
      applyMomentum();
    } else {
      snapToClosest();
    }
  };

  const applyMomentum = () => {
    setIsAnimating(true);
    
    let velocity = momentum;
    let currentPosition = 0;
    let lastTimestamp = performance.now();
    
    const animateMomentum = (timestamp: number) => {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Calculate deceleration
      velocity *= 0.95;
      
      // Apply movement
      currentPosition += velocity * delta;
      
      // Convert position to index change
      const indexChange = Math.round(currentPosition / itemHeight);
      const targetIndex = Math.max(0, Math.min(values.length - 1, selectedIndex - indexChange));
      
      if (targetIndex !== selectedIndex) {
        setSelectedIndex(targetIndex);
      }
      
      // Continue animation if velocity is significant
      if (Math.abs(velocity) > 0.02) {
        animationRef.current = requestAnimationFrame(animateMomentum);
      } else {
        snapToClosest();
      }
    };
    
    animationRef.current = requestAnimationFrame(animateMomentum);
  };

  const snapToClosest = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleItemClick = (index: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedIndex(index);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const wheelHeight = itemHeight * visibleItems;
  const halfVisibleItems = Math.floor(visibleItems / 2);

  return (
    <div 
      className={cn("relative overflow-hidden rounded-xl bg-secondary/20 shadow-neu-card", className)}
      style={{ height: `${wheelHeight}px`, width: "100%" }}
      ref={containerRef}
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={(e) => handleStart(e.clientY)}
      onMouseMove={(e) => isDragging && handleMove(e.clientY)}
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
            isAnimating={isAnimating}
          />
        ))}
      </div>
    </div>
  );
};

export default WheelSelector;
