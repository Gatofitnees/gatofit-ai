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
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Load default foods on mount
  useEffect(() => {
    loadDefaultFoods();
  }, []);

  const loadDefaultFoods = useCallback(async (reset = true) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      
      const { data, error: dbError } = await supabase
        .from('food_items')
        .select('*')
        .range(currentOffset, currentOffset + 19)
        .order('name');

      if (dbError) {
        throw new Error(dbError.message || 'Error al cargar alimentos');
      }

      // Transform data to match expected format
      const transformedResults = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name,
        description: '',
        category: item.food_category,
        nutrition: {
          calories: item.calories_per_serving,
          protein: item.protein_g_per_serving,
          carbs: item.carbs_g_per_serving,
          fat: item.fat_g_per_serving,
          serving_size: item.serving_size_grams ? `${item.serving_size_grams}g` : '100g'
        }
      }));

      if (reset) {
        setResults(transformedResults);
        setOffset(20);
      } else {
        setResults(prev => [...prev, ...transformedResults]);
        setOffset(prev => prev + 20);
      }
      
      setHasMore(transformedResults.length === 20);
    } catch (err) {
      console.error('Error loading default foods:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar alimentos';
      setError(errorMessage);
      if (reset) setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  const searchFoods = useCallback(async (query: string, filters?: any) => {
    setIsLoading(true);
    setError(null);
    setOffset(0);
    setHasMore(true);

    try {
      let dbQuery = supabase
        .from('food_items')
        .select('*');

      // Apply text search if query exists
      if (query.trim()) {
        dbQuery = dbQuery.ilike('name', `%${query}%`);
      }

      // Apply category filters if they exist
      if (filters?.categories && filters.categories.length > 0) {
        dbQuery = dbQuery.in('food_category', filters.categories);
      }

      // Apply macro filters if they exist
      if (filters) {
        if (filters.minCalories) {
          dbQuery = dbQuery.gte('calories_per_serving', filters.minCalories);
        }
        if (filters.maxCalories) {
          dbQuery = dbQuery.lte('calories_per_serving', filters.maxCalories);
        }
        if (filters.minProtein) {
          dbQuery = dbQuery.gte('protein_g_per_serving', filters.minProtein);
        }
        if (filters.maxProtein) {
          dbQuery = dbQuery.lte('protein_g_per_serving', filters.maxProtein);
        }
        if (filters.minCarbs) {
          dbQuery = dbQuery.gte('carbs_g_per_serving', filters.minCarbs);
        }
        if (filters.maxCarbs) {
          dbQuery = dbQuery.lte('carbs_g_per_serving', filters.maxCarbs);
        }
        if (filters.minFat) {
          dbQuery = dbQuery.gte('fat_g_per_serving', filters.minFat);
        }
        if (filters.maxFat) {
          dbQuery = dbQuery.lte('fat_g_per_serving', filters.maxFat);
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
        category: item.food_category,
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

  const loadMoreFoods = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    await loadDefaultFoods(false);
  }, [hasMore, isLoading, loadDefaultFoods]);

  return {
    searchFoods,
    loadDefaultFoods,
    loadMoreFoods,
    results,
    isLoading,
    error,
    hasMore,
  };
};