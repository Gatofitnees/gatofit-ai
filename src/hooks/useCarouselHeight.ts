
import { useState, useEffect, useRef } from 'react';

interface UseCarouselHeightProps {
  currentIndex: number;
  itemsCount: number;
}

export const useCarouselHeight = ({ currentIndex, itemsCount }: UseCarouselHeightProps) => {
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Función para medir la altura de un elemento
  const measureHeight = (element: HTMLDivElement | null): number => {
    if (!element) return 0;
    
    // Forzar un reflow para obtener la altura real
    element.style.height = 'auto';
    const height = element.scrollHeight;
    return height;
  };

  // Actualizar altura cuando cambia el índice actual
  useEffect(() => {
    const currentItem = itemRefs.current[currentIndex];
    if (currentItem) {
      setIsTransitioning(true);
      
      const newHeight = measureHeight(currentItem);
      setContainerHeight(newHeight);
      
      // Remover el estado de transición después de la animación
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  // Función para establecer ref de un item
  const setItemRef = (index: number) => (element: HTMLDivElement | null) => {
    itemRefs.current[index] = element;
    
    // Si es el primer elemento y no tenemos altura establecida, establecerla
    if (index === currentIndex && containerHeight === 0 && element) {
      const initialHeight = measureHeight(element);
      setContainerHeight(initialHeight);
    }
  };

  return {
    containerHeight,
    setItemRef,
    isTransitioning
  };
};
