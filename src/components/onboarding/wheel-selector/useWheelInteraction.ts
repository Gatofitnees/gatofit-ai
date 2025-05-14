
import { useState, useRef } from "react";
import { calculateNewIndex } from "./utils";

interface UseWheelInteractionProps {
  itemHeight: number;
  values: Array<{ label: string; value: any }>;
  onChange: (value: any) => void;
  initialSelectedIndex: number;
}

export function useWheelInteraction({
  itemHeight,
  values,
  onChange,
  initialSelectedIndex
}: UseWheelInteractionProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const currentTranslateY = useRef(0);
  const touchId = useRef<number | null>(null);

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
    
    const newIndex = calculateNewIndex(diffY, itemHeight, selectedIndex, values.length);
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const currentY = e.clientY;
    const diffY = currentY - startY.current;
    currentTranslateY.current = diffY;
    
    const newIndex = calculateNewIndex(diffY, itemHeight, selectedIndex, values.length);
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

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
  };

  return {
    selectedIndex,
    setSelectedIndex,
    handleTouchStart,
    handleMouseDown,
    handleTouchMove,
    handleMouseMove,
    handleTouchEnd,
    handleEnd,
    handleItemClick
  };
}
