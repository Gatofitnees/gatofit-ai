
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
    
    if (!visualViewport) return;

    const handleResize = () => {
      requestAnimationFrame(() => {
        const newKeyboardHeight = window.innerHeight - visualViewport.height;
        // Umbral para ignorar cambios menores como la barra de navegación del navegador.
        const finalHeight = newKeyboardHeight > 150 ? newKeyboardHeight : 0;
        setKeyboardHeight(finalHeight);
      });
    };

    visualViewport.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardHeight;
};
