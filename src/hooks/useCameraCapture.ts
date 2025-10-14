
import { useCallback } from 'react';
import { uploadImageWithAnalysis } from './useImageUpload';
import { CapturedFood } from './useFoodCapture';

export const useCameraCapture = (sendToWebhookWithResponse: (url: string, blob: Blob, isFromGallery?: boolean) => Promise<any>) => {
  const captureFromCamera = useCallback((): Promise<CapturedFood | null> => {
    return new Promise((resolve) => {
      // For web, we'll use the file input with camera capture
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*'; // Accept any image format
      input.capture = 'environment'; // Use rear camera by default
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const result = await uploadImageWithAnalysis(file, sendToWebhookWithResponse);
            resolve(result);
          } catch (error) {
            console.error('Error uploading camera image:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      input.oncancel = () => {
        resolve(null);
      };

      input.click();
    });
  }, [sendToWebhookWithResponse]);

  const captureFromGallery = useCallback((): Promise<CapturedFood | null> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        console.log('📸 Gallery file selected:', { 
          name: file.name, 
          size: file.size, 
          type: file.type 
        });
        
        try {
          // Validaciones tempranas
          if (file.size === 0) {
            throw new Error('El archivo seleccionado está vacío');
          }
          
          if (file.size > 10 * 1024 * 1024) {
            throw new Error('El archivo es muy grande (máximo 10MB)');
          }
          
          console.log('📤 Uploading gallery image...');
          
          // Upload with gallery flag - NO CONVERTIR AQUÍ
          const galleryWebhookWrapper = (url: string, blob: Blob) => 
            sendToWebhookWithResponse(url, blob, true);
          
          const result = await uploadImageWithAnalysis(file, galleryWebhookWrapper);
          
          if (!result) {
            throw new Error('No se pudo procesar la imagen');
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ Error in gallery capture:', error);
          reject(error instanceof Error ? error : new Error('Error al procesar imagen'));
        }
      };

      input.oncancel = () => {
        console.log('Gallery selection cancelled');
        resolve(null);
      };

      input.click();
    });
  }, [sendToWebhookWithResponse]);

  return {
    captureFromCamera,
    captureFromGallery
  };
};
