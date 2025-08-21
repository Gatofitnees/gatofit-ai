import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FoodSearchResult {
  id: string;
  name: string;
  description: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  categoryIcon?: string;
  categoryColor?: string;
  nutrition?: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
    serving_size: string;
  };
}

export const useFoodSearch = () => {
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load default foods on mount
  useEffect(() => {
    loadDefaultFoods();
  }, []);

  const loadDefaultFoods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('fatsecret-search', {
        body: { 
          searchQuery: "",
          categoryId: null 
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Error al cargar alimentos');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResults(data?.results || []);
    } catch (err) {
      console.error('Error loading default foods:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar alimentos';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchFoods = useCallback(async (query: string, categoryId?: number | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('fatsecret-search', {
        body: { 
          searchQuery: query,
          categoryId: categoryId 
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Error en la búsqueda de alimentos');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResults(data?.results || []);
    } catch (err) {
      console.error('Error in searchFoods:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al buscar alimentos';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchFoods,
    loadDefaultFoods,
    results,
    isLoading,
    error,
  };
};