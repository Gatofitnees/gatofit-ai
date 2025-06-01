
import { useState } from 'react';
import { useWebhookResponse, FoodAnalysisResult } from './useWebhookResponse';
import { useCameraCapture } from './useCameraCapture';
import { uploadImage, uploadImageWithAnalysis } from './useImageUpload';
import { sendToWebhook } from '@/services/webhookService';

export interface CapturedFood {
  imageUrl: string;
  fileName: string;
  analysisResult?: FoodAnalysisResult | null;
}

export interface AnalysisCallback {
  onSuccess: (result: FoodAnalysisResult) => void;
  onError: (error: string) => void;
}

export const useFoodCapture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendToWebhookWithResponse, isAnalyzing, analysisError, clearError: clearAnalysisError } = useWebhookResponse();
  const { captureFromCamera, captureFromGallery } = useCameraCapture(sendToWebhookWithResponse);

  const clearError = () => {
    setError(null);
    clearAnalysisError();
  };

  const wrappedCaptureFromCamera = async (): Promise<CapturedFood | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await captureFromCamera();
      if (!result) {
        setError('Error al analizar la imagen');
        return null;
      }
      return result;
    } catch (err) {
      console.error('Error capturing from camera:', err);
      setError('Error al capturar imagen');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const wrappedCaptureFromGallery = async (): Promise<CapturedFood | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await captureFromGallery();
      if (!result) {
        setError('Error al analizar la imagen');
        return null;
      }
      return result;
    } catch (err) {
      console.error('Error capturing from gallery:', err);
      setError('Error al seleccionar imagen');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const wrappedUploadImageWithAnalysis = async (file: Blob): Promise<CapturedFood | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadImageWithAnalysis(file, sendToWebhookWithResponse);
      if (!result) {
        setError('Error al analizar la imagen');
        return null;
      }
      return result;
    } catch (err) {
      console.error('Error uploading image with analysis:', err);
      setError('Error al subir la imagen');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImageOnly = async (file: Blob): Promise<{ imageUrl: string; fileName: string } | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadImage(file);
      if (!result) {
        setError('Error al subir la imagen');
        return null;
      }
      return { imageUrl: result.imageUrl, fileName: result.fileName };
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error al subir la imagen');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeImageAsync = async (imageUrl: string, imageBlob: Blob, callback: AnalysisCallback) => {
    try {
      const result = await sendToWebhookWithResponse(imageUrl, imageBlob);
      if (result) {
        callback.onSuccess(result);
      } else {
        callback.onError('Hey parece que eso no se come, inténtalo nuevamente');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      callback.onError('Hey parece que eso no se come, inténtalo nuevamente');
    }
  };

  return {
    captureFromCamera: wrappedCaptureFromCamera,
    captureFromGallery: wrappedCaptureFromGallery,
    uploadImage,
    uploadImageWithAnalysis: wrappedUploadImageWithAnalysis,
    uploadImageOnly,
    analyzeImageAsync,
    sendToWebhook,
    isLoading: isLoading || isAnalyzing,
    error: error || analysisError,
    clearError
  };
};
