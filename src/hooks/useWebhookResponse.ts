
import { useState } from 'react';

export interface WebhookResponse {
  Comida?: {
    custom_food_name: string;
    quantity_consumed: number;
    unit_consumed: string;
    calories_consumed: string;
    protein_g_consumed: string;
    carbs_g_consumed: string;
    fat_g_consumed: string;
    healthScore: string;
    ingredients: Array<{
      name: string;
      grams: string;
      calories: string;
      protein: string;
      carbs: string;
      fat: string;
    }>;
  };
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
  healthScore: number;
  ingredients: Array<{
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
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

export const useWebhookResponse = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const sendToWebhookWithResponse = async (imageUrl: string, imageBlob: Blob): Promise<FoodAnalysisResult | null> => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    console.log('Sending image to webhook with response handling...', { 
      imageUrl, 
      blobSize: imageBlob.size,
      mimeType: getImageMimeType(imageBlob)
    });
    
    const formData = new FormData();
    formData.append('imageUrl', imageUrl);
    
    // Use original image format instead of forcing JPG
    const extension = getImageExtension(imageBlob);
    formData.append('image', imageBlob, `food-image.${extension}`);
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

        // Check for error in the new format
        if (result.error) {
          console.log('Webhook returned error:', result.error);
          setAnalysisError(result.error);
          return null;
        }

        // Extract data from "Comida" field
        if (result.Comida) {
          console.log('Food detected by webhook:', result.Comida);
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

  const parseWebhookFoodResponse = (comidaData: WebhookResponse['Comida']): FoodAnalysisResult => {
    if (!comidaData) {
      throw new Error('No food data received');
    }

    console.log('Parsing webhook food data:', comidaData);
    
    // Parse ingredients with proper type conversion
    const ingredients = comidaData.ingredients?.map(ingredient => ({
      name: ingredient.name,
      grams: parseFloat(ingredient.grams) || 0,
      calories: parseFloat(ingredient.calories) || 0,
      protein: parseFloat(ingredient.protein) || 0,
      carbs: parseFloat(ingredient.carbs) || 0,
      fat: parseFloat(ingredient.fat) || 0
    })) || [];

    return {
      name: comidaData.custom_food_name,
      calories: parseFloat(comidaData.calories_consumed) || 0,
      protein: parseFloat(comidaData.protein_g_consumed) || 0,
      carbs: parseFloat(comidaData.carbs_g_consumed) || 0,
      fat: parseFloat(comidaData.fat_g_consumed) || 0,
      servingSize: comidaData.quantity_consumed || 1,
      servingUnit: comidaData.unit_consumed || 'porción',
      healthScore: parseFloat(comidaData.healthScore) || 7,
      ingredients
    };
  };

  return {
    sendToWebhookWithResponse,
    isAnalyzing,
    analysisError,
    clearError: () => setAnalysisError(null)
  };
};
