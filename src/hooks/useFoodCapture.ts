
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
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const { 
    sendToWebhookWithResponse, 
    isAnalyzing, 
    analysisError, 
    analysisProgress,
    analysisPhase,
    clearError: clearAnalysisError 
  } = useWebhookResponse();
  const { captureFromCamera, captureFromGallery } = useCameraCapture(sendToWebhookWithResponse);

  const clearError = () => {
    setError(null);
    clearAnalysisError();
  };

  const clearAll = () => {
    console.log('Clearing all food capture state');
    setCapturedImageUrl(null);
    setAnalysisResult(null);
    setError(null);
    clearAnalysisError();
  };

  const captureImageOnly = async (fromCamera: boolean = true): Promise<string | null> => {
    console.log('Capturing image only...');
    setIsLoading(true);
    setError(null);
    setCapturedImageUrl(null);
    setAnalysisResult(null);
    
    try {
      const result = fromCamera ? await captureFromCamera() : await captureFromGallery();
      
      if (result) {
        console.log('Image captured successfully:', result.imageUrl);
        setCapturedImageUrl(result.imageUrl);
        return result.imageUrl;
      } else {
        setError('Error al capturar la imagen');
        return null;
      }
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Error al capturar imagen');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeImage = async (imageUrl: string, imageBlob: Blob): Promise<FoodAnalysisResult | null> => {
    console.log('Starting image analysis...');
    try {
      const result = await sendToWebhookWithResponse(imageUrl, imageBlob);
      console.log('Analysis completed:', result);
      setAnalysisResult(result);
      return result;
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Error al analizar la imagen');
      return null;
    }
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

  return {
    // New simplified flow methods
    captureImageOnly,
    analyzeImage,
    capturedImageUrl,
    analysisResult,
    clearAll,
    
    // Analysis state
    isAnalyzing,
    analysisError,
    analysisProgress,
    analysisPhase,
    
    // Legacy methods for compatibility
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
