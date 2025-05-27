
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWebhookResponse, FoodAnalysisResult } from './useWebhookResponse';

export interface CapturedFood {
  imageUrl: string;
  fileName: string;
  analysisResult?: FoodAnalysisResult | null;
}

export const useFoodCapture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendToWebhookWithResponse, isAnalyzing, analysisError } = useWebhookResponse();

  const sendToWebhook = async (imageUrl: string, imageBlob: Blob) => {
    try {
      console.log('Sending image to webhook...', { imageUrl, blobSize: imageBlob.size });
      
      const formData = new FormData();
      formData.append('imageUrl', imageUrl);
      formData.append('image', imageBlob, 'food-image.jpg');
      formData.append('timestamp', new Date().toISOString());
      
      const response = await fetch('https://gaton8n.gatofit.com/webhook-test/e39f095b-fb33-4ce3-b41a-619a650149f5', {
        method: 'POST',
        mode: 'no-cors', // Handle CORS issues
        body: formData,
      });

      // With no-cors mode, we can't read the response status
      // but the request will be sent if the endpoint is accessible
      console.log('Image sent to webhook successfully (no-cors mode)');
    } catch (error) {
      console.error('Error sending to webhook:', error);
      // Don't throw the error to avoid blocking the main flow
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
          const result = await uploadImageWithAnalysis(file);
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
          console.log('Gallery file selected in hook:', file.name, 'Size:', file.size, 'Type:', file.type);
          const result = await uploadImageWithAnalysis(file);
          resolve(result);
        } else {
          console.log('No file selected from gallery');
          resolve(null);
        }
        setIsLoading(false);
      };

      input.oncancel = () => {
        console.log('Gallery selection cancelled');
        setIsLoading(false);
        resolve(null);
      };

      input.click();
    });
  }, []);

  const uploadImageWithAnalysis = async (file: Blob): Promise<CapturedFood | null> => {
    try {
      console.log('Uploading image to Supabase...', { fileSize: file.size, fileType: file.type });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('food-images')
        .upload(fileName, file);

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName);

      console.log('Image uploaded successfully to Supabase:', publicUrl);

      // Send to webhook and get analysis result
      const analysisResult = await sendToWebhookWithResponse(publicUrl, file);

      return {
        imageUrl: publicUrl,
        fileName: data.path,
        analysisResult
      };
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error al subir la imagen');
      return null;
    }
  };

  const uploadImage = async (file: Blob): Promise<CapturedFood | null> => {
    try {
      console.log('Uploading image to Supabase...', { fileSize: file.size, fileType: file.type });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('food-images')
        .upload(fileName, file);

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName);

      console.log('Image uploaded successfully to Supabase:', publicUrl);

      return {
        imageUrl: publicUrl,
        fileName: data.path
      };
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error al subir la imagen');
      return null;
    }
  };

  return {
    captureFromCamera,
    captureFromGallery,
    uploadImage,
    uploadImageWithAnalysis,
    sendToWebhook,
    isLoading: isLoading || isAnalyzing,
    error: error || analysisError
  };
};
