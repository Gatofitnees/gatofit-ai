
import { useState, useRef, useCallback, useEffect } from 'react';

export const useDynamicHeight = (itemsCount: number) => {
  const [currentHeight, setCurrentHeight] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setItemRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  const updateHeight = useCallback((index: number) => {
    const item = itemRefs.current[index];
    if (item) {
      const height = item.offsetHeight;
      setCurrentHeight(height);
      setCurrentIndex(index);
    }
  }, []);

  useEffect(() => {
    // Actualizar altura inicial
    if (itemRefs.current[0]) {
      updateHeight(0);
    }
  }, [updateHeight]);

  const handleSlideChange = useCallback((index: number) => {
    updateHeight(index);
  }, [updateHeight]);

  return {
    currentHeight,
    currentIndex,
    containerRef,
    setItemRef,
    handleSlideChange
  };
};
