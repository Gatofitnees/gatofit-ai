
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
      // If result is null (due to webhook error), don't return it as success
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
      // If result is null (due to webhook error), don't return it as success
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
      // If result is null (due to webhook error), don't return it as success
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

  return {
    captureFromCamera: wrappedCaptureFromCamera,
    captureFromGallery: wrappedCaptureFromGallery,
    uploadImage,
    uploadImageWithAnalysis: wrappedUploadImageWithAnalysis,
    sendToWebhook,
    isLoading: isLoading || isAnalyzing,
    error: error || analysisError,
    clearError
  };
};
