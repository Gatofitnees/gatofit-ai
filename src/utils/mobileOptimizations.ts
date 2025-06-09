
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export const isMobile = () => {
  return Capacitor.isNativePlatform();
};

export const getDeviceInfo = async () => {
  if (!isMobile()) {
    return {
      platform: 'web',
      model: 'Unknown',
      osVersion: 'Unknown'
    };
  }

  try {
    const info = await Device.getInfo();
    return {
      platform: info.platform,
      model: info.model,
      osVersion: info.osVersion
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      platform: 'unknown',
      model: 'Unknown',
      osVersion: 'Unknown'
    };
  }
};

export const optimizeForMobile = () => {
  if (isMobile()) {
    // Disable text selection on mobile for better UX
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Prevent zoom on input focus
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
    
    // Add mobile-specific classes
    document.body.classList.add('mobile-app');
  }
};
