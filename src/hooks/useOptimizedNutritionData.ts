
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedTimezone } from './useOptimizedTimezone';
import { FoodLogEntry } from './useFoodLog';

interface CachedNutritionData {
  datesWithFood: Date[];
  entriesForDate: { [key: string]: FoodLogEntry[] };
  lastFetch: number;
}

const CACHE_DURATION = 60000; // 1 minute cache
const VISIBLE_DAYS_RANGE = 32; // Days to fetch

export const useOptimizedNutritionData = (selectedDate: Date) => {
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const { timezoneInfo } = useOptimizedTimezone();
  
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [datesWithFood, setDatesWithFood] = useState<Date[]>([]);
  const [cachedData, setCachedData] = useState<CachedNutritionData | null>(null);
  const loadingRef = useRef(false);

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  // Calculate today's totals from actual entries
  const todayTotals = entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories_consumed,
      protein: totals.protein + entry.protein_g_consumed,
      carbs: totals.carbs + entry.carbs_g_consumed,
      fat: totals.fat + entry.fat_g_consumed
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Use initial recommendations from profile as targets, with fallbacks
  const macros = {
    calories: { 
      current: todayTotals.calories, 
      target: profile?.initial_recommended_calories || 2000, 
      unit: "kcal" 
    },
    protein: { 
      current: todayTotals.protein, 
      target: profile?.initial_recommended_protein_g || 120 
    },
    carbs: { 
      current: todayTotals.carbs, 
      target: profile?.initial_recommended_carbs_g || 200 
    },
    fats: { 
      current: todayTotals.fat, 
      target: profile?.initial_recommended_fats_g || 65 
    }
  };

  // Optimized function to fetch dates with food entries
  const fetchDatesWithFoodOptimized = useCallback(async () => {
    if (!user || !timezoneInfo) return [];
    
    try {
      const userCurrentDate = new Date();
      const startDate = new Date(userCurrentDate);
      startDate.setDate(startDate.getDate() - 30); // 30 days ago
      const endDate = new Date(userCurrentDate);
      endDate.setDate(endDate.getDate() + 1); // 1 day future
      
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .select('log_date')
        .eq('user_id', user.id)
        .gte('log_date', startDateString)
        .lte('log_date', endDateString);

      if (error) throw error;

      // Convert to unique dates
      const uniqueDates = Array.from(new Set(
        (data || []).map(item => item.log_date)
      )).map(dateString => new Date(dateString + 'T12:00:00')); // Set to noon to avoid timezone issues

      return uniqueDates;
    } catch (error) {
      console.error("Error fetching dates with food:", error);
      return [];
    }
  }, [user, timezoneInfo]);

  // Optimized function to fetch entries for a specific date
  const fetchEntriesForDateOptimized = useCallback(async (dateString: string) => {
    if (!user || !timezoneInfo) return [];
    
    try {
      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', dateString)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      
      // Convert to FoodLogEntry format
      const convertedEntries: FoodLogEntry[] = (data || []).map(entry => ({
        id: entry.id,
        food_item_id: entry.food_item_id || undefined,
        custom_food_name: entry.custom_food_name || '',
        photo_url: entry.photo_url || undefined,
        meal_type: entry.meal_type,
        quantity_consumed: entry.quantity_consumed,
        unit_consumed: entry.unit_consumed || '',
        calories_consumed: entry.calories_consumed,
        protein_g_consumed: entry.protein_g_consumed,
        carbs_g_consumed: entry.carbs_g_consumed,
        fat_g_consumed: entry.fat_g_consumed,
        health_score: entry.health_score || undefined,
        ingredients: entry.ingredients ? JSON.parse(JSON.stringify(entry.ingredients)) : undefined,
        notes: entry.notes || '',
        logged_at: entry.logged_at,
        log_date: entry.log_date
      }));
      
      return convertedEntries;
    } catch (error) {
      console.error("Error fetching entries for date:", error);
      return [];
    }
  }, [user, timezoneInfo]);

  // Load optimized data with caching
  const loadOptimizedNutritionData = useCallback(async () => {
    if (!user || !timezoneInfo || loadingRef.current) return;
    
    const now = Date.now();
    
    // Check if we have valid cached data for dates with food
    if (cachedData && (now - cachedData.lastFetch) < CACHE_DURATION) {
      setDatesWithFood(cachedData.datesWithFood);
      
      // Check if we have cached entries for the selected date
      if (cachedData.entriesForDate[selectedDateString]) {
        setEntries(cachedData.entriesForDate[selectedDateString]);
        return;
      }
    }
    
    setIsLoading(true);
    loadingRef.current = true;
    
    try {
      // Fetch dates with food and entries for selected date in parallel
      const [foodDates, selectedDateEntries] = await Promise.all([
        fetchDatesWithFoodOptimized(),
        fetchEntriesForDateOptimized(selectedDateString)
      ]);
      
      // Update cache
      const newCachedData: CachedNutritionData = {
        datesWithFood: foodDates,
        entriesForDate: {
          ...(cachedData?.entriesForDate || {}),
          [selectedDateString]: selectedDateEntries
        },
        lastFetch: now
      };
      
      setCachedData(newCachedData);
      setDatesWithFood(foodDates);
      setEntries(selectedDateEntries);
      
    } catch (error) {
      console.error("Error loading optimized nutrition data:", error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user, timezoneInfo, selectedDateString, cachedData, fetchDatesWithFoodOptimized, fetchEntriesForDateOptimized]);

  // Load data when component mounts or selected date changes
  useEffect(() => {
    if (timezoneInfo) {
      loadOptimizedNutritionData();
    }
  }, [loadOptimizedNutritionData, timezoneInfo]);

  // Refresh function for manual refresh
  const refreshNutritionData = useCallback(() => {
    setCachedData(null); // Clear cache to force fresh fetch
    loadingRef.current = false;
    loadOptimizedNutritionData();
  }, [loadOptimizedNutritionData]);

  // Delete entry function
  const deleteEntry = useCallback(async (entryId: number) => {
    try {
      const { error } = await supabase
        .from('daily_food_log_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      // Update local state immediately
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      
      // Invalidate cache for the affected date
      if (cachedData) {
        const updatedCache = {
          ...cachedData,
          entriesForDate: {
            ...cachedData.entriesForDate,
            [selectedDateString]: entries.filter(entry => entry.id !== entryId)
          }
        };
        setCachedData(updatedCache);
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting entry:", error);
      return false;
    }
  }, [selectedDateString, entries, cachedData]);

  return {
    entries,
    isLoading,
    datesWithFood,
    macros,
    todayTotals,
    deleteEntry,
    refreshNutritionData
  };
};
