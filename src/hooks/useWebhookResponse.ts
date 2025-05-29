
import { useState } from 'react';
import { validateImageFile, sanitizeFoodName } from '@/utils/validation';
import { sanitizeWebhookData, createSecureFormData } from '@/utils/securityHelpers';
import { createSecureErrorMessage, logSecurityEvent } from '@/utils/errorHandling';

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

export interface WebhookOutputItem {
  output: WebhookComidaData;
}

export interface WebhookResponse {
  Comida?: WebhookComidaData | string;
  error?: string;
}

export type WebhookArrayResponse = WebhookOutputItem[];

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

export const useWebhookResponse = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const sendToWebhookWithResponse = async (imageUrl: string, imageBlob: Blob): Promise<FoodAnalysisResult | null> => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    // Validate image file
    const validation = validateImageFile(new File([imageBlob], 'image', { type: imageBlob.type }));
    if (!validation.isValid) {
      setAnalysisError(validation.error || 'Archivo de imagen inválido');
      setIsAnalyzing(false);
      logSecurityEvent('invalid_file_upload', validation.error);
      return null;
    }

    console.log('Sending image to webhook with security validation...', { 
      blobSize: imageBlob.size,
      mimeType: imageBlob.type
    });
    
    try {
      const formData = createSecureFormData(imageBlob, imageUrl);
      
      const response = await fetch('https://gaton8n.gatofit.com/webhook/e39f095b-fb33-4ce3-b41a-619a650149f5', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseText = await response.text();
        console.log('Webhook response received');
        
        let parsedResponse: any;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse webhook response');
          setAnalysisError(createSecureErrorMessage(parseError, 'webhook'));
          logSecurityEvent('webhook_parse_error', 'Invalid JSON response');
          return null;
        }
        
        // Sanitize the response data
        const sanitizedResponse = sanitizeWebhookData(parsedResponse);
        
        // Check for new array format first
        if (Array.isArray(parsedResponse)) {
          if (parsedResponse.length === 0) {
            setAnalysisError('No se detectó información de comida');
            return null;
          }

          const firstItem = parsedResponse[0];
          if (firstItem && firstItem.output) {
            return parseWebhookFoodResponse(sanitizeWebhookData(firstItem.output));
          } else {
            setAnalysisError(createSecureErrorMessage(new Error('Invalid response structure'), 'webhook'));
            logSecurityEvent('webhook_invalid_structure', 'Array format missing output');
            return null;
          }
        }

        // Fallback to legacy format
        const legacyResult = parsedResponse as WebhookResponse;

        if (legacyResult.error) {
          setAnalysisError(createSecureErrorMessage(new Error(legacyResult.error), 'webhook'));
          return null;
        }

        if (legacyResult.Comida) {
          if (typeof legacyResult.Comida === 'string') {
            if (legacyResult.Comida === '[object Object]') {
              setAnalysisError(createSecureErrorMessage(new Error('Serialization error'), 'webhook'));
              logSecurityEvent('webhook_serialization_error', 'Object serialization issue');
              return null;
            }
            
            try {
              const parsedComida = JSON.parse(legacyResult.Comida);
              return parseWebhookFoodResponse(sanitizeWebhookData(parsedComida));
            } catch (stringParseError) {
              setAnalysisError(createSecureErrorMessage(stringParseError, 'webhook'));
              return null;
            }
          }

          return parseWebhookFoodResponse(sanitizeWebhookData(legacyResult.Comida));
        } else {
          setAnalysisError('No se detectó información de comida');
          return null;
        }
      } else {
        console.warn('Webhook request failed:', response.status);
        setAnalysisError(createSecureErrorMessage(new Error(`HTTP ${response.status}`), 'network'));
        logSecurityEvent('webhook_http_error', `Status: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
      logSecurityEvent('webhook_network_error', error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback with no-cors
      try {
        const fallbackFormData = createSecureFormData(imageBlob, imageUrl);
        await fetch('https://gaton8n.gatofit.com/webhook/e39f095b-fb33-4ce3-b41a-619a650149f5', {
          method: 'POST',
          mode: 'no-cors',
          body: fallbackFormData,
        });
        console.log('Fallback request sent');
      } catch (fallbackError) {
        console.error('Fallback request failed');
      }
      
      setAnalysisError(createSecureErrorMessage(error, 'network'));
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseWebhookFoodResponse = (comidaData: WebhookComidaData): FoodAnalysisResult => {
    if (!comidaData) {
      throw new Error('No food data received');
    }

    console.log('Parsing webhook food data with validation');
    
    // Parse and validate ingredients
    const ingredients = comidaData.ingredients?.map(ingredient => ({
      name: sanitizeFoodName(ingredient.name || ''),
      grams: parseFloat(ingredient.grams) || 0,
      calories: parseFloat(ingredient.calories) || 0,
      protein: parseFloat(ingredient.protein) || 0,
      carbs: parseFloat(ingredient.carbs) || 0,
      fat: parseFloat(ingredient.fat) || 0
    })) || [];

    const parsedResult = {
      name: sanitizeFoodName(comidaData.custom_food_name || 'Alimento detectado'),
      calories: parseFloat(comidaData.calories_consumed) || 0,
      protein: parseFloat(comidaData.protein_g_consumed) || 0,
      carbs: parseFloat(comidaData.carbs_g_consumed) || 0,
      fat: parseFloat(comidaData.fat_g_consumed) || 0,
      servingSize: comidaData.quantity_consumed || 1,
      servingUnit: sanitizeFoodName(comidaData.unit_consumed || 'porción'),
      healthScore: Math.min(Math.max(parseFloat(comidaData.healthScore) || 7, 1), 10),
      ingredients
    };

    console.log('Food data parsed and validated');
    return parsedResult;
  };

  return {
    sendToWebhookWithResponse,
    isAnalyzing,
    analysisError,
    clearError: () => setAnalysisError(null)
  };
};
