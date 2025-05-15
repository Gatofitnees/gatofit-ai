
import { useState, useRef, useEffect } from "react";
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
  const [isAnimating, setIsAnimating] = useState(false);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const currentTranslateY = useRef(0);
  const touchId = useRef<number | null>(null);
  const momentumId = useRef<number | null>(null);
  const velocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);

  // Clear any ongoing animations when component unmounts
  useEffect(() => {
    return () => {
      if (momentumId.current !== null) {
        cancelAnimationFrame(momentumId.current);
      }
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchId.current !== null) return;
    
    const touch = e.touches[0];
    touchId.current = touch.identifier;
    handleStartDrag(touch.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDragging.current) return;
    
    handleStartDrag(e.clientY);
  };

  const handleStartDrag = (clientY: number) => {
    // Clear any ongoing momentum animation
    if (momentumId.current !== null) {
      cancelAnimationFrame(momentumId.current);
      momentumId.current = null;
    }
    
    isDragging.current = true;
    startY.current = clientY;
    lastY.current = clientY;
    lastTime.current = Date.now();
    currentTranslateY.current = 0;
    velocity.current = 0;
    document.body.style.overflow = "hidden"; // Prevent scrolling
    setIsAnimating(false);
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
    handleMove(currentY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    handleMove(e.clientY);
  };

  const handleMove = (clientY: number) => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime.current;
    
    if (deltaTime > 0) {
      const deltaY = clientY - lastY.current;
      velocity.current = deltaY / deltaTime * 15; // Adjust multiplier for momentum sensitivity
    }
    
    lastY.current = clientY;
    lastTime.current = currentTime;
    
    const diffY = clientY - startY.current;
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
      handleEndDrag();
    }
  };

  const handleEndDrag = () => {
    isDragging.current = false;
    touchId.current = null;
    document.body.style.overflow = ""; // Re-enable scrolling
    
    // Apply momentum if velocity is significant
    if (Math.abs(velocity.current) > 0.5) {
      applyMomentum();
    } else {
      // Ensure we snap to the closest item
      snapToClosestItem();
    }
  };

  const applyMomentum = () => {
    setIsAnimating(true);
    
    const animate = () => {
      // Determine final index based on current velocity
      const estimatedDistance = velocity.current * 10; // How far it would travel
      const estimatedIndexChange = Math.round(estimatedDistance / itemHeight);
      let targetIndex = Math.max(0, Math.min(values.length - 1, selectedIndex - estimatedIndexChange));
      
      // Animate to the target index
      setSelectedIndex(targetIndex);
      
      // Decelerate the momentum
      velocity.current = 0;
      momentumId.current = null;
      
      // Small delay before allowing new interactions
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    };
    
    momentumId.current = requestAnimationFrame(animate);
  };

  const snapToClosestItem = () => {
    // No need to snap, the index is already integer-based
    // but we can add a small animation to make it look smoother
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

  return {
    selectedIndex,
    setSelectedIndex,
    isAnimating,
    handleTouchStart,
    handleMouseDown,
    handleTouchMove,
    handleMouseMove,
    handleTouchEnd,
    handleEndDrag,
    handleItemClick
  };
}
