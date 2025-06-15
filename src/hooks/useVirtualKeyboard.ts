
import { useState, useEffect } from 'react';

// Función debounce para retrasar la ejecución y evitar múltiples llamadas
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const isLikelyMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const useVirtualKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !isLikelyMobile()) return;

    const visualViewport = window.visualViewport;
    
    const setDebouncedKeyboardHeight = debounce((height: number) => {
      setKeyboardHeight(height);
    }, 50); // Un pequeño delay para esperar a que el reajuste del tamaño se estabilice

    if (visualViewport) {
      const handleResize = () => {
        // requestAnimationFrame asegura que leamos la altura después de que el navegador haya renderizado los cambios
        requestAnimationFrame(() => {
          const newKeyboardHeight = window.innerHeight - visualViewport.height;
          // El umbral de 100px ayuda a ignorar cambios menores como la aparición de la barra de navegación
          const finalHeight = newKeyboardHeight > 100 ? newKeyboardHeight : 0;
          setDebouncedKeyboardHeight(finalHeight);
        });
      };

      visualViewport.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        visualViewport.removeEventListener('resize', handleResize);
      };
    } else {
      // Método de respaldo para navegadores más antiguos
      const initialHeight = window.innerHeight;
      
      const handleResize = () => {
        const newKeyboardHeight = initialHeight - window.innerHeight;
        const finalHeight = newKeyboardHeight > 100 ? newKeyboardHeight : 0;
        setDebouncedKeyboardHeight(finalHeight);
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return keyboardHeight;
};
