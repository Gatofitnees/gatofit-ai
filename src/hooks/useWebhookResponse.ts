
import { useState } from 'react';

export interface WebhookIngredient {
  name: string;
  grams: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface WebhookComidaData {
  custom_food_name: string;
  quantity_consumed: number;
  unit_consumed: string;
  calories_consumed: string;
  protein_g_consumed: string;
  carbs_g_consumed: string;
  fat_g_consumed: string;
  healthScore: string;
  ingredients: WebhookIngredient[];
}

export interface WebhookResponse {
  Comida?: WebhookComidaData | string; // Puede ser objeto o string "[object Object]"
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
        const responseText = await response.text();
        console.log('Raw webhook response:', responseText);
        
        // More comprehensive logging for debugging
        console.log('Response text type:', typeof responseText);
        console.log('Response text length:', responseText.length);
        console.log('Response text sample:', responseText.substring(0, 200));
        
        let result: WebhookResponse;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse webhook response as JSON:', parseError);
          setAnalysisError('Error al procesar respuesta del servidor');
          return null;
        }
        
        console.log('Parsed webhook response:', result);
        console.log('Comida field type:', typeof result.Comida);
        console.log('Comida field value:', result.Comida);

        // Check for error in the new format
        if (result.error) {
          console.log('Webhook returned error:', result.error);
          setAnalysisError(result.error);
          return null;
        }

        // Extract data from "Comida" field
        if (result.Comida) {
          // Check if Comida is the problematic "[object Object]" string
          if (typeof result.Comida === 'string') {
            console.error('Webhook returned invalid Comida data as string:', result.Comida);
            
            // Try to detect if it's a serialization issue
            if (result.Comida === '[object Object]') {
              console.error('Detected [object Object] serialization issue');
              setAnalysisError('Error: Datos de comida inválidos del servidor (serialización)');
              return null;
            }
            
            // Try to parse the string as JSON in case it's double-encoded
            try {
              const parsedComida = JSON.parse(result.Comida);
              console.log('Successfully parsed Comida string as JSON:', parsedComida);
              return parseWebhookFoodResponse(parsedComida);
            } catch (stringParseError) {
              console.error('Failed to parse Comida string as JSON:', stringParseError);
              setAnalysisError('Error: Datos de comida inválidos del servidor');
              return null;
            }
          }

          // If Comida is an object, process it directly
          console.log('Food detected by webhook:', result.Comida);
          return parseWebhookFoodResponse(result.Comida);
        } else {
          console.warn('No Comida data found in webhook response');
          setAnalysisError('No se detectó información de comida');
          return null;
        }
      } else {
        console.warn('Webhook request failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        setAnalysisError('Error al analizar la imagen');
        return null;
      }

      return null;
    } catch (error) {
      console.error('Error sending to webhook:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
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

  const parseWebhookFoodResponse = (comidaData: WebhookComidaData): FoodAnalysisResult => {
    if (!comidaData) {
      throw new Error('No food data received');
    }

    console.log('Parsing webhook food data:', comidaData);
    console.log('Comida data type:', typeof comidaData);
    console.log('Comida data keys:', Object.keys(comidaData));
    
    // Parse ingredients with proper type conversion and validation
    const ingredients = comidaData.ingredients?.map(ingredient => {
      console.log('Processing ingredient:', ingredient);
      return {
        name: ingredient.name || '',
        grams: parseFloat(ingredient.grams) || 0,
        calories: parseFloat(ingredient.calories) || 0,
        protein: parseFloat(ingredient.protein) || 0,
        carbs: parseFloat(ingredient.carbs) || 0,
        fat: parseFloat(ingredient.fat) || 0
      };
    }) || [];

    console.log('Processed ingredients:', ingredients);

    const parsedResult = {
      name: comidaData.custom_food_name || 'Alimento detectado',
      calories: parseFloat(comidaData.calories_consumed) || 0,
      protein: parseFloat(comidaData.protein_g_consumed) || 0,
      carbs: parseFloat(comidaData.carbs_g_consumed) || 0,
      fat: parseFloat(comidaData.fat_g_consumed) || 0,
      servingSize: comidaData.quantity_consumed || 1,
      servingUnit: comidaData.unit_consumed || 'porción',
      healthScore: parseFloat(comidaData.healthScore) || 7,
      ingredients
    };

    console.log('Parsed analysis result:', parsedResult);
    return parsedResult;
  };

  return {
    sendToWebhookWithResponse,
    isAnalyzing,
    analysisError,
    clearError: () => setAnalysisError(null)
  };
};
