
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CapturedFood {
  imageUrl: string;
  fileName: string;
}

export const useFoodCapture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendToWebhook = async (imageUrl: string, imageBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('imageUrl', imageUrl);
      formData.append('image', imageBlob, 'food-image.jpg');
      formData.append('timestamp', new Date().toISOString());
      
      const response = await fetch('https://gaton8n.gatofit.com/webhook-test/e39f095b-fb33-4ce3-b41a-619a650149f5', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.warn('Webhook request failed:', response.statusText);
      } else {
        console.log('Image sent to webhook successfully');
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
    }
  };

  const captureFromCamera = useCallback((): Promise<CapturedFood | null> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setError(null);

      // For web, we'll use the file input with camera capture
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera by default
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const result = await uploadImage(file);
          if (result) {
            // Send to webhook
            await sendToWebhook(result.imageUrl, file);
          }
          resolve(result);
        } else {
          resolve(null);
        }
        setIsLoading(false);
      };

      input.oncancel = () => {
        setIsLoading(false);
        resolve(null);
      };

      input.click();
    });
  }, []);

  const captureFromGallery = useCallback((): Promise<CapturedFood | null> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setError(null);

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const result = await uploadImage(file);
          if (result) {
            // Send to webhook
            await sendToWebhook(result.imageUrl, file);
          }
          resolve(result);
        } else {
          resolve(null);
        }
        setIsLoading(false);
      };

      input.oncancel = () => {
        setIsLoading(false);
        resolve(null);
      };

      input.click();
    });
  }, []);

  const uploadImage = async (file: Blob): Promise<CapturedFood | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('food-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName);

      return {
        imageUrl: publicUrl,
        fileName: data.path
      };
    } catch (err) {
      setError('Error al subir la imagen');
      return null;
    }
  };

  return {
    captureFromCamera,
    captureFromGallery,
    uploadImage,
    sendToWebhook,
    isLoading,
    error
  };
};
