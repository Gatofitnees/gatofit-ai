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
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const searchFoods = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setIsUsingFallback(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsUsingFallback(false);

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
        
        // Handle specific error types
        if (data.fatsecret_error) {
          throw new Error('El servicio de búsqueda está temporalmente no disponible. Intenta de nuevo más tarde.');
        }
        
        if (data.no_results) {
          throw new Error(data.details || 'No se encontraron alimentos para esta búsqueda');
        }
        
        const errorMessage = data.details ? 
          `${data.error}: ${data.details}` : 
          data.error;
        throw new Error(errorMessage);
      }

      console.log('✅ Resultados obtenidos:', data?.results?.length || 0);
      
      // Show message if using fallback database
      if (data?.fallback && data?.message) {
        console.log('📋 Usando base de datos local:', data.message);
        setIsUsingFallback(true);
      }
      
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
    isUsingFallback,
  };
};