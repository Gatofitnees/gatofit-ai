
import { useState, useEffect } from 'react';

const isLikelyMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const useVirtualKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !isLikelyMobile()) return;

    const visualViewport = window.visualViewport;
    
    if (visualViewport) {
      const handleResize = () => {
        const newKeyboardHeight = window.innerHeight - visualViewport.height;
        // Se usa un umbral para evitar falsos positivos con la barra de navegación del browser
        setKeyboardHeight(newKeyboardHeight > 100 ? newKeyboardHeight : 0);
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
        setKeyboardHeight(newKeyboardHeight > 100 ? newKeyboardHeight : 0);
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return keyboardHeight;
};
