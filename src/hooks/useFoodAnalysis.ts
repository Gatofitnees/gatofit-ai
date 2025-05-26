
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IngredientDetail {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodAnalysis {
  isFood: boolean;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  ingredients: IngredientDetail[];
  servingSize: number;
  servingUnit: string;
  confidence: number;
}

export const useFoodAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFood = async (imageUrl: string): Promise<FoodAnalysis | null> => {
    try {
      setIsAnalyzing(true);
      setError(null);

      console.log('Starting food analysis for image:', imageUrl);

      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageUrl }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Analysis result received:', data);

      // Verificar si es comida
      if (!data.isFood) {
        setError('No se detectó comida en la imagen. Por favor, toma una foto de un alimento.');
        return null;
      }

      return data;
    } catch (err) {
      console.error('Food analysis error:', err);
      setError('Error al analizar el alimento');
      
      // Fallback data para desarrollo
      return {
        isFood: true,
        name: 'Alimento detectado',
        calories: 200,
        protein: 10,
        carbs: 30,
        fat: 5,
        healthScore: 7,
        ingredients: [
          {
            name: 'Ingrediente principal',
            grams: 100,
            calories: 150,
            protein: 8,
            carbs: 20,
            fat: 3
          }
        ],
        servingSize: 1,
        servingUnit: 'porción',
        confidence: 0.8
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeFood,
    isAnalyzing,
    error
  };
};
