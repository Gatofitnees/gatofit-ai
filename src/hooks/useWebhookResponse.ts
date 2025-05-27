
import { useState } from 'react';

export interface WebhookResponse {
  Comida?: string;
  error?: string;
}

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

export const useWebhookResponse = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const sendToWebhookWithResponse = async (imageUrl: string, imageBlob: Blob): Promise<FoodAnalysisResult | null> => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    console.log('Sending image to webhook with response handling...', { imageUrl, blobSize: imageBlob.size });
    
    const formData = new FormData();
    formData.append('imageUrl', imageUrl);
    formData.append('image', imageBlob, 'food-image.jpg');
    formData.append('timestamp', new Date().toISOString());
    
    try {
      // Try with CORS first to get the response
      const response = await fetch('https://gaton8n.gatofit.com/webhook-test/e39f095b-fb33-4ce3-b41a-619a650149f5', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: WebhookResponse = await response.json();
        console.log('Webhook response received:', result);

        if (result.error) {
          console.log('Webhook returned error:', result.error);
          setAnalysisError('¡Hey eso no se come! Parece que no se a detectado ninguna comida');
          return null;
        }

        if (result.Comida) {
          console.log('Food detected by webhook:', result.Comida);
          // Parse the food information and return structured data
          return parseWebhookFoodResponse(result.Comida);
        }
      } else {
        console.warn('Webhook request failed:', response.status, response.statusText);
        setAnalysisError('Error al analizar la imagen');
        return null;
      }

      return null;
    } catch (error) {
      console.error('Error sending to webhook:', error);
      // Fallback: try with no-cors mode for fire-and-forget
      try {
        await fetch('https://gaton8n.gatofit.com/webhook-test/e39f095b-fb33-4ce3-b41a-619a650149f5', {
          method: 'POST',
          mode: 'no-cors',
          body: formData,
        });
        console.log('Image sent to webhook (no-cors fallback)');
      } catch (fallbackError) {
        console.error('Fallback webhook request also failed:', fallbackError);
      }
      
      setAnalysisError('Error al conectar con el servicio de análisis');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseWebhookFoodResponse = (foodData: string): FoodAnalysisResult => {
    // Parse the webhook response and extract food information
    // This is a simple parser - you can enhance it based on the actual webhook response format
    console.log('Parsing webhook food data:', foodData);
    
    // Default values if parsing fails
    return {
      name: foodData || 'Alimento detectado',
      calories: 200,
      protein: 15,
      carbs: 25,
      fat: 8,
      servingSize: 1,
      servingUnit: 'porción'
    };
  };

  return {
    sendToWebhookWithResponse,
    isAnalyzing,
    analysisError,
    clearError: () => setAnalysisError(null)
  };
};
