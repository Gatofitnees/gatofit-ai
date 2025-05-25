
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  ingredients: string[];
  servingSize: number;
  servingUnit: string;
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

      return data;
    } catch (err) {
      setError('Error al analizar el alimento');
      console.error('Food analysis error:', err);
      
      // Fallback data for development
      return {
        name: 'Alimento detectado',
        calories: 200,
        protein: 10,
        carbs: 30,
        fat: 5,
        healthScore: 7,
        ingredients: ['Ingrediente principal'],
        servingSize: 1,
        servingUnit: 'porción'
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
