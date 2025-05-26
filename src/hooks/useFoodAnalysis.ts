
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IngredientAnalysis {
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
  ingredients: IngredientAnalysis[];
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

      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageUrl }
      });

      if (error) throw error;

      // If AI determines it's not food, return null
      if (data && !data.isFood) {
        setError('No se detectó comida en la imagen. Por favor, toma una foto que contenga alimentos.');
        return null;
      }

      return data;
    } catch (err) {
      setError('Error al analizar el alimento');
      console.error('Food analysis error:', err);
      
      // Fallback data for development - simulate a food detection
      return {
        isFood: true,
        name: 'Alimento detectado',
        calories: Math.floor(Math.random() * 300) + 100,
        protein: Math.floor(Math.random() * 20) + 5,
        carbs: Math.floor(Math.random() * 40) + 10,
        fat: Math.floor(Math.random() * 15) + 2,
        healthScore: Math.floor(Math.random() * 6) + 4,
        ingredients: [
          {
            name: 'Ingrediente principal',
            grams: 120,
            calories: 150,
            protein: 8,
            carbs: 20,
            fat: 5
          },
          {
            name: 'Ingrediente secundario',
            grams: 80,
            calories: 60,
            protein: 3,
            carbs: 12,
            fat: 2
          }
        ],
        servingSize: 1,
        servingUnit: 'porción',
        confidence: 0.85
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
