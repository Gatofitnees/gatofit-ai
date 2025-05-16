
import { useCallback } from "react";

interface UseWheelTouchHandlersProps {
  handleStart: (clientY: number) => void;
  handleMove: (clientY: number) => void;
  handleEnd: () => void;
  isDragging: boolean;
}

export const useWheelTouchHandlers = ({
  handleStart,
  handleMove,
  handleEnd,
  isDragging
}: UseWheelTouchHandlersProps) => {
  // Prevent default on wheel to avoid page scroll
  const preventDefaultAndStop = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Touch event handlers
  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      preventDefaultAndStop(e);
      handleStart(e.touches[0].clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      preventDefaultAndStop(e);
      handleMove(e.touches[0].clientY);
    },
    onTouchEnd: () => handleEnd(),
    onTouchCancel: () => handleEnd()
  };

  // Mouse event handlers
  const mouseHandlers = {
    onMouseDown: (e: React.MouseEvent) => {
      preventDefaultAndStop(e);
      handleStart(e.clientY);
    },
    onMouseMove: (e: React.MouseEvent) => isDragging && handleMove(e.clientY),
    onMouseUp: () => handleEnd(),
    onMouseLeave: () => isDragging && handleEnd()
  };

  return {
    touchHandlers,
    mouseHandlers
  };
};
