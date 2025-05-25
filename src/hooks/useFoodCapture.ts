
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CapturedFood {
  imageUrl: string;
  fileName: string;
}

export const useFoodCapture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureFromCamera = useCallback(async (): Promise<CapturedFood | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              const result = await uploadImage(blob);
              stream.getTracks().forEach(track => track.stop());
              resolve(result);
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.8);
        };
      });
    } catch (err) {
      setError('Error al acceder a la cámara');
      return null;
    } finally {
      setIsLoading(false);
    }
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
    isLoading,
    error
  };
};
