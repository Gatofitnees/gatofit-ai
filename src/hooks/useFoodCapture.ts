import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWebhookResponse, FoodAnalysisResult } from './useWebhookResponse';

export interface CapturedFood {
  imageUrl: string;
  fileName: string;
  analysisResult?: FoodAnalysisResult | null;
}

const getImageMimeType = (file: Blob): string => {
  if (file.type) return file.type;
  return 'image/jpeg'; // fallback
};

const getImageExtension = (file: Blob): string => {
  const mimeType = getImageMimeType(file);
  switch (mimeType) {
    case 'image/png': return 'png';
    case 'image/jpeg': return 'jpg';
    case 'image/webp': return 'webp';
    case 'image/gif': return 'gif';
    case 'image/bmp': return 'bmp';
    default: return 'jpg';
  }
};

const convertImageToJpg = async (file: Blob): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Fill with white background (for transparency)
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      canvas.toBlob((blob) => {
        resolve(blob || file);
      }, 'image/jpeg', 0.9);
    };
    
    img.onerror = () => {
      // If conversion fails, return original file
      resolve(file);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const useFoodCapture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendToWebhookWithResponse, isAnalyzing, analysisError } = useWebhookResponse();

  const sendToWebhook = async (imageUrl: string, imageBlob: Blob) => {
    try {
      console.log('Sending image to webhook...', { 
        imageUrl, 
        blobSize: imageBlob.size,
        mimeType: getImageMimeType(imageBlob)
      });
      
      const formData = new FormData();
      formData.append('imageUrl', imageUrl);
      
      // Use original image format
      const extension = getImageExtension(imageBlob);
      formData.append('image', imageBlob, `food-image.${extension}`);
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
      input.accept = 'image/*'; // Accept any image format
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
      input.accept = 'image/*'; // Accept any image format
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          console.log('Gallery file selected in hook:', file.name, 'Size:', file.size, 'Type:', file.type);
          
          // Convert to JPG if it's from gallery
          const convertedFile = await convertImageToJpg(file);
          console.log('Image converted to JPG for gallery upload');
          
          const result = await uploadImageWithAnalysis(convertedFile);
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
      console.log('Uploading image to Supabase...', { 
        fileSize: file.size, 
        fileType: file.type || 'unknown'
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Use original file extension instead of forcing .jpg
      const extension = getImageExtension(file);
      const fileName = `${user.id}/${Date.now()}.${extension}`;
      
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
      console.log('Uploading image to Supabase...', { 
        fileSize: file.size, 
        fileType: file.type || 'unknown'
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Use original file extension
      const extension = getImageExtension(file);
      const fileName = `${user.id}/${Date.now()}.${extension}`;
      
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
