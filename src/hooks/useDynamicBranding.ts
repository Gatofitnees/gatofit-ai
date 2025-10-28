import { useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

export const useDynamicBranding = () => {
  const { branding } = useBranding();

  useEffect(() => {
    if (!branding.hasCoach) return;

    // Convertir hex a HSL para Tailwind
    const hexToHSL = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return '207 90% 54%'; // Fallback to default primary
      
      const r = parseInt(result[1], 16) / 255;
      const g = parseInt(result[2], 16) / 255;
      const b = parseInt(result[3], 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Inyectar colores del coach
    const root = document.documentElement;
    const primaryHSL = hexToHSL(branding.primaryButtonColor);
    
    root.style.setProperty('--primary', primaryHSL);
    root.style.setProperty('--primary-foreground', hexToHSL(branding.primaryButtonFillColor));
    root.style.setProperty('--glow-color', `${branding.primaryButtonColor}80`); // 80 = 50% opacity hex
    
    // Limpiar al desmontar
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--glow-color');
    };
  }, [branding]);
};
