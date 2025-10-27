export interface CoachBranding {
  companyName: string;
  bannerImageUrl: string;
  logoImageUrl: string;
  rankingImageUrl: string;
  primaryButtonColor: string;
  primaryButtonFillColor: string;
  hasCoach: boolean;
}

export const DEFAULT_GATOFIT_BRANDING: CoachBranding = {
  companyName: 'Gatofit',
  bannerImageUrl: 'https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif',
  logoImageUrl: 'https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/gatofit%20logo%20APP.png',
  rankingImageUrl: 'https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif',
  primaryButtonColor: '#2094F3',
  primaryButtonFillColor: '#2094F3',
  hasCoach: false
};
