
import { useCallback } from 'react';
import { uploadImageWithAnalysis } from './useImageUpload';
import { convertImageToJpg } from '@/utils/imageUtils';
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
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*'; // Accept any image format
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          console.log('📸 Gallery file selected:', { 
            name: file.name, 
            size: file.size, 
            type: file.type 
          });
          
          try {
            // Validate file before processing
            if (file.size === 0) {
              console.error('❌ Empty file selected');
              throw new Error('Archivo vacío');
            }
            
            if (file.size > 10 * 1024 * 1024) {
              console.error('❌ File too large:', file.size);
              throw new Error('Archivo muy grande (>10MB)');
            }
            
            // Convert to JPG for consistency
            console.log('🔄 Converting to JPG...');
            const convertedFile = await convertImageToJpg(file);
            console.log('✅ Conversion complete:', { 
              size: convertedFile.size, 
              type: convertedFile.type 
            });
            
            // Create wrapper that passes isFromGallery flag
            const galleryWebhookWrapper = (url: string, blob: Blob) => 
              sendToWebhookWithResponse(url, blob, true);
            
            const result = await uploadImageWithAnalysis(convertedFile, galleryWebhookWrapper);
            resolve(result);
          } catch (error) {
            console.error('❌ Error in gallery capture:', error);
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
