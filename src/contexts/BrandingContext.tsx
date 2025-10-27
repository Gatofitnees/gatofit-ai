import React, { createContext, useContext, ReactNode } from 'react';
import { useCoachBranding } from '@/hooks/useCoachBranding';
import { CoachBranding, DEFAULT_GATOFIT_BRANDING } from '@/types/branding';

interface BrandingContextType {
  branding: CoachBranding;
  loading: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: DEFAULT_GATOFIT_BRANDING,
  loading: true
});

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

interface BrandingProviderProps {
  children: ReactNode;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({ children }) => {
  const { branding, loading } = useCoachBranding();

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
};
