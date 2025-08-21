import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FoodSearchResult {
  id: string;
  name: string;
  description: string;
  brand?: string;
  nutrition?: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
    serving_size: string;
  };
}

export const useFatSecretSearch = () => {
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFoods = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('fatsecret-search', {
        body: { searchQuery: query }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Error en la búsqueda');
      }

      setResults(data?.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchFoods,
    results,
    isLoading,
    error,
  };
};