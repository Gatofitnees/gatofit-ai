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
      const { data, error: dbError } = await supabase
        .from('food_items')
        .select('*')
        .limit(20)
        .order('name');

      if (dbError) {
        throw new Error(dbError.message || 'Error al cargar alimentos');
      }

      // Transform data to match expected format
      const transformedResults = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name,
        description: '',
        nutrition: {
          calories: item.calories_per_serving,
          protein: item.protein_g_per_serving,
          carbs: item.carbs_g_per_serving,
          fat: item.fat_g_per_serving,
          serving_size: item.serving_size_grams ? `${item.serving_size_grams}g` : '100g'
        }
      }));

      setResults(transformedResults);
    } catch (err) {
      console.error('Error loading default foods:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar alimentos';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchFoods = useCallback(async (query: string, macroFilters?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      let dbQuery = supabase
        .from('food_items')
        .select('*');

      // Apply text search if query exists
      if (query.trim()) {
        dbQuery = dbQuery.ilike('name', `%${query}%`);
      }

      // Apply macro filters if they exist
      if (macroFilters) {
        if (macroFilters.minCalories) {
          dbQuery = dbQuery.gte('calories_per_serving', macroFilters.minCalories);
        }
        if (macroFilters.maxCalories) {
          dbQuery = dbQuery.lte('calories_per_serving', macroFilters.maxCalories);
        }
        if (macroFilters.minProtein) {
          dbQuery = dbQuery.gte('protein_g_per_serving', macroFilters.minProtein);
        }
        if (macroFilters.maxProtein) {
          dbQuery = dbQuery.lte('protein_g_per_serving', macroFilters.maxProtein);
        }
        if (macroFilters.minCarbs) {
          dbQuery = dbQuery.gte('carbs_g_per_serving', macroFilters.minCarbs);
        }
        if (macroFilters.maxCarbs) {
          dbQuery = dbQuery.lte('carbs_g_per_serving', macroFilters.maxCarbs);
        }
        if (macroFilters.minFat) {
          dbQuery = dbQuery.gte('fat_g_per_serving', macroFilters.minFat);
        }
        if (macroFilters.maxFat) {
          dbQuery = dbQuery.lte('fat_g_per_serving', macroFilters.maxFat);
        }
      }

      const { data, error: dbError } = await dbQuery
        .limit(50)
        .order('name');

      if (dbError) {
        throw new Error(dbError.message || 'Error en la búsqueda de alimentos');
      }

      // Transform data to match expected format
      const transformedResults = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name,
        description: '',
        nutrition: {
          calories: item.calories_per_serving,
          protein: item.protein_g_per_serving,
          carbs: item.carbs_g_per_serving,
          fat: item.fat_g_per_serving,
          serving_size: item.serving_size_grams ? `${item.serving_size_grams}g` : '100g'
        }
      }));

      setResults(transformedResults);
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