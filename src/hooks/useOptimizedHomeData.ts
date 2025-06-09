
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedTimezone } from './useOptimizedTimezone';

interface WorkoutSummary {
  id: number;
  name: string;
  duration: string;
  calories: number;
  date: string;
  exercises: string[];
}

interface CachedActivityData {
  workoutDates: Date[];
  todayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  lastFetch: number;
}

const CACHE_DURATION = 60000; // 1 minute cache
const VISIBLE_DAYS_RANGE = 32; // Days to fetch (30 past + today + 1 future)

export const useOptimizedHomeData = () => {
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const { getUserCurrentDateString, convertToUserTimezone, getUserCurrentDate, timezoneInfo } = useOptimizedTimezone();
  
  const [selectedDate, setSelectedDate] = useState(getUserCurrentDate());
  const [hasCompletedWorkout, setHasCompletedWorkout] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [datesWithWorkouts, setDatesWithWorkouts] = useState<Date[]>([]);
  const [cachedData, setCachedData] = useState<CachedActivityData | null>(null);
  const initializationRef = useRef(false);
  const loadingRef = useRef(false);
  
  // Calculate today's totals from cached data
  const [todayTotals, setTodayTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // Use latest recommendations from profile as targets, with fallbacks
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

  // Optimized function to fetch activity dates with limited range
  const fetchActivityDatesOptimized = useCallback(async () => {
    if (!user || !timezoneInfo) return [];
    
    try {
      const userCurrentDate = getUserCurrentDate();
      const startDate = new Date(userCurrentDate);
      startDate.setDate(startDate.getDate() - 30); // 30 days ago
      const endDate = new Date(userCurrentDate);
      endDate.setDate(endDate.getDate() + 1); // 1 day future
      
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];

      // Fetch workout dates in parallel with food dates
      const [workoutResponse, foodResponse] = await Promise.all([
        supabase
          .from('workout_logs')
          .select('workout_date')
          .eq('user_id', user.id)
          .gte('workout_date', `${startDateString}T00:00:00`)
          .lte('workout_date', `${endDateString}T23:59:59`)
          .order('workout_date', { ascending: false }),
        supabase
          .from('daily_food_log_entries')
          .select('log_date')
          .eq('user_id', user.id)
          .gte('log_date', startDateString)
          .lte('log_date', endDateString)
      ]);

      if (workoutResponse.error) throw workoutResponse.error;
      if (foodResponse.error) throw foodResponse.error;

      // Convert workout dates to user timezone and combine with food dates
      const workoutDates = (workoutResponse.data || [])
        .map(item => convertToUserTimezone(new Date(item.workout_date)));
      
      const foodDates = (foodResponse.data || [])
        .map(item => new Date(item.log_date + 'T12:00:00')); // Set to noon to avoid timezone issues

      // Combine and deduplicate dates
      const allActivityDates = Array.from(new Set([
        ...workoutDates.map(d => d.toDateString()),
        ...foodDates.map(d => d.toDateString())
      ])).map(dateString => new Date(dateString));

      return allActivityDates;
    } catch (error) {
      console.error("Error fetching activity dates:", error);
      return [];
    }
  }, [user, getUserCurrentDate, convertToUserTimezone, timezoneInfo]);

  // Optimized function to fetch today's food data
  const fetchTodaysFoodDataOptimized = useCallback(async () => {
    if (!user || !timezoneInfo) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    try {
      const today = getUserCurrentDateString();
      
      const { data: entries, error } = await supabase
        .from('daily_food_log_entries')
        .select('calories_consumed, protein_g_consumed, carbs_g_consumed, fat_g_consumed')
        .eq('user_id', user.id)
        .eq('log_date', today);
          
      if (error) throw error;
      
      if (entries && entries.length > 0) {
        return entries.reduce(
          (acc, entry) => ({
            calories: acc.calories + entry.calories_consumed,
            protein: acc.protein + entry.protein_g_consumed,
            carbs: acc.carbs + entry.carbs_g_consumed,
            fat: acc.fat + entry.fat_g_consumed
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
      }
      
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    } catch (error) {
      console.error("Error fetching today's food data:", error);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  }, [user, getUserCurrentDateString, timezoneInfo]);

  // Load cached data or fetch fresh data (optimized with debounce)
  const loadOptimizedData = useCallback(async () => {
    if (!user || !timezoneInfo || loadingRef.current) return;
    
    loadingRef.current = true;
    const now = Date.now();
    
    // Check if we have valid cached data
    if (cachedData && (now - cachedData.lastFetch) < CACHE_DURATION) {
      setDatesWithWorkouts(cachedData.workoutDates);
      setTodayTotals(cachedData.todayTotals);
      loadingRef.current = false;
      return;
    }
    
    try {
      // Fetch fresh data in parallel
      const [activityDates, todaysTotals] = await Promise.all([
        fetchActivityDatesOptimized(),
        fetchTodaysFoodDataOptimized()
      ]);
      
      // Update cache
      const newCachedData: CachedActivityData = {
        workoutDates: activityDates,
        todayTotals: todaysTotals,
        lastFetch: now
      };
      
      setCachedData(newCachedData);
      setDatesWithWorkouts(activityDates);
      setTodayTotals(todaysTotals);
      
    } catch (error) {
      console.error("Error loading optimized data:", error);
    } finally {
      loadingRef.current = false;
    }
  }, [user, timezoneInfo, cachedData, fetchActivityDatesOptimized, fetchTodaysFoodDataOptimized]);

  // Load workout data for selected date using user's timezone
  const fetchDailyWorkout = useCallback(async () => {
    if (!user || !timezoneInfo) return;
    
    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      const { data: workoutLogs, error } = await supabase
        .from('workout_logs')
        .select(`
          id,
          routine_name_snapshot,
          duration_completed_minutes,
          calories_burned_estimated,
          workout_date,
          workout_log_exercise_details(exercise_name_snapshot)
        `)
        .eq('user_id', user.id)
        .gte('workout_date', `${dateString}T00:00:00`)
        .lt('workout_date', `${dateString}T23:59:59`)
        .order('workout_date', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (workoutLogs && workoutLogs.length > 0) {
        const workout = workoutLogs[0];
        
        const exerciseNames = Array.from(
          new Set(
            workout.workout_log_exercise_details
              .map((detail: any) => detail.exercise_name_snapshot)
          )
        ).slice(0, 3);
        
        setWorkoutSummary({
          id: workout.id,
          name: workout.routine_name_snapshot || "Entrenamiento",
          duration: `${workout.duration_completed_minutes || 0} min`,
          calories: workout.calories_burned_estimated || 0,
          date: workout.workout_date,
          exercises: exerciseNames
        });
        setHasCompletedWorkout(true);
      } else {
        setWorkoutSummary(undefined);
        setHasCompletedWorkout(false);
      }
    } catch (error) {
      console.error("Error loading workout:", error);
      setHasCompletedWorkout(false);
      setWorkoutSummary(undefined);
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate, timezoneInfo]);

  // Initial data load (only once when dependencies are ready)
  useEffect(() => {
    if (user && timezoneInfo && !initializationRef.current) {
      initializationRef.current = true;
      loadOptimizedData();
    }
  }, [user, timezoneInfo]);

  // Load workout for selected date
  useEffect(() => {
    if (timezoneInfo) {
      fetchDailyWorkout();
    }
  }, [fetchDailyWorkout, timezoneInfo]);

  // Update selected date when timezone info changes
  useEffect(() => {
    if (timezoneInfo && selectedDate.toDateString() !== getUserCurrentDate().toDateString()) {
      setSelectedDate(getUserCurrentDate());
    }
  }, [timezoneInfo, getUserCurrentDate]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Refresh function for manual refresh
  const refreshData = useCallback(() => {
    setCachedData(null); // Clear cache to force fresh fetch
    initializationRef.current = false;
    loadOptimizedData();
    fetchDailyWorkout();
  }, [loadOptimizedData, fetchDailyWorkout]);

  return {
    selectedDate,
    hasCompletedWorkout,
    workoutSummary,
    loading,
    datesWithWorkouts,
    macros,
    handleDateSelect,
    refreshData
  };
};
