
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

interface PlatformInfo {
  isNative: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isWeb: boolean;
  platform: string;
}

export const usePlatform = (): PlatformInfo => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isNative: false,
    isAndroid: false,
    isIOS: false,
    isWeb: true,
    platform: 'web'
  });

  useEffect(() => {
    const getPlatformInfo = async () => {
      const isNative = Capacitor.isNativePlatform();
      
      if (isNative) {
        try {
          const deviceInfo = await Device.getInfo();
          const platform = deviceInfo.platform;
          
          setPlatformInfo({
            isNative: true,
            isAndroid: platform === 'android',
            isIOS: platform === 'ios',
            isWeb: false,
            platform: platform
          });
        } catch (error) {
          console.error('Error getting device info:', error);
          setPlatformInfo({
            isNative: true,
            isAndroid: false,
            isIOS: false,
            isWeb: false,
            platform: 'unknown'
          });
        }
      } else {
        setPlatformInfo({
          isNative: false,
          isAndroid: false,
          isIOS: false,
          isWeb: true,
          platform: 'web'
        });
      }
    };

    getPlatformInfo();
  }, []);

  return platformInfo;
};
