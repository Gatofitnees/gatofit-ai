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
      console.log('🔍 Iniciando búsqueda de alimentos:', query);
      
      const { data, error: functionError } = await supabase.functions.invoke('fatsecret-search', {
        body: { searchQuery: query }
      });

      console.log('📡 Respuesta de la función:', { data, functionError });

      if (functionError) {
        console.error('❌ Error de la función:', functionError);
        throw new Error(functionError.message || 'Error en la búsqueda de alimentos');
      }

      if (data?.error) {
        console.error('❌ Error en los datos:', data.error);
        const errorMessage = data.details ? 
          `${data.error}: ${data.details}` : 
          data.error;
        throw new Error(errorMessage);
      }

      console.log('✅ Resultados obtenidos:', data?.results?.length || 0);
      setResults(data?.results || []);
    } catch (err) {
      console.error('💥 Error en searchFoods:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al buscar alimentos';
      setError(errorMessage);
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