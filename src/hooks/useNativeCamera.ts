
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useState } from 'react';

export const useNativeCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  const takePicture = async (): Promise<Photo | null> => {
    if (!isNative) {
      console.log('Not running on native platform, using web camera');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      return image;
    } catch (err: any) {
      console.error('Error taking picture:', err);
      setError('Error al tomar la foto');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async (): Promise<Photo | null> => {
    if (!isNative) {
      console.log('Not running on native platform, using web gallery');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      return image;
    } catch (err: any) {
      console.error('Error selecting from gallery:', err);
      setError('Error al seleccionar imagen');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const permissions = await Camera.checkPermissions();
      return permissions;
    } catch (err) {
      console.error('Error checking camera permissions:', err);
      return { camera: 'denied', photos: 'denied' };
    }
  };

  const requestPermissions = async () => {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions;
    } catch (err) {
      console.error('Error requesting camera permissions:', err);
      return { camera: 'denied', photos: 'denied' };
    }
  };

  return {
    takePicture,
    selectFromGallery,
    checkPermissions,
    requestPermissions,
    isLoading,
    error,
    isNative,
    clearError: () => setError(null)
  };
};
