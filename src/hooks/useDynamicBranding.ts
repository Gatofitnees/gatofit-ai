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

    // Calcular luminancia para determinar si usar texto blanco o negro
    const getLuminance = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return 0.5;
      
      const r = parseInt(result[1], 16) / 255;
      const g = parseInt(result[2], 16) / 255;
      const b = parseInt(result[3], 16) / 255;

      // Fórmula de luminancia relativa
      const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    // Inyectar colores del coach
    const root = document.documentElement;
    const primaryHSL = hexToHSL(branding.primaryButtonColor);
    const luminance = getLuminance(branding.primaryButtonColor);
    
    // Si el color primario es claro (luminancia > 0.5), usar texto negro, sino blanco
    const foregroundColor = luminance > 0.5 ? '0 0% 10%' : '0 0% 100%';
    
    root.style.setProperty('--primary', primaryHSL);
    root.style.setProperty('--primary-foreground', foregroundColor);
    root.style.setProperty('--glow-color', `${branding.primaryButtonColor}80`);
    
    // Limpiar al desmontar
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--glow-color');
    };
  }, [branding]);
};
