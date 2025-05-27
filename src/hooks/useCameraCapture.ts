
import { useCallback } from 'react';
import { uploadImageWithAnalysis } from './useImageUpload';
import { convertImageToJpg } from '@/utils/imageUtils';
import { CapturedFood } from './useFoodCapture';

export const useCameraCapture = (sendToWebhookWithResponse: (url: string, blob: Blob) => Promise<any>) => {
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
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*'; // Accept any image format
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          console.log('Gallery file selected in hook:', file.name, 'Size:', file.size, 'Type:', file.type);
          
          try {
            // Convert to JPG if it's from gallery
            const convertedFile = await convertImageToJpg(file);
            console.log('Image converted to JPG for gallery upload');
            
            const result = await uploadImageWithAnalysis(convertedFile, sendToWebhookWithResponse);
            resolve(result);
          } catch (error) {
            console.error('Error uploading gallery image:', error);
            resolve(null);
          }
        } else {
          console.log('No file selected from gallery');
          resolve(null);
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
