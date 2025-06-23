
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocalTimezone } from "./useLocalTimezone";

interface WorkoutSummary {
  id: number;
  name: string;
  duration: string;
  calories: number;
  date: string;
  exercises: string[];
  exerciseCount?: number;
  totalSets?: number;
}

interface MacroData {
  calories: { current: number; target: number; unit: string };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
}

export const useHomePageData = () => {
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasCompletedWorkout, setHasCompletedWorkout] = useState(false);
  const [workoutSummaries, setWorkoutSummaries] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [datesWithWorkouts, setDatesWithWorkouts] = useState<Date[]>([]);
  const { getLocalDateString, getLocalDayRange } = useLocalTimezone();
  
  const [macros, setMacros] = useState<MacroData>({
    calories: { 
      current: 0, 
      target: profile?.initial_recommended_calories || 2000, 
      unit: "kcal" 
    },
    protein: { 
      current: 0, 
      target: profile?.initial_recommended_protein_g || 120 
    },
    carbs: { 
      current: 0, 
      target: profile?.initial_recommended_carbs_g || 200 
    },
    fats: { 
      current: 0, 
      target: profile?.initial_recommended_fats_g || 65 
    }
  });

  // Update macro targets when profile changes
  useEffect(() => {
    if (profile) {
      setMacros(prev => ({
        calories: { 
          current: prev.calories.current, 
          target: profile.initial_recommended_calories || 2000, 
          unit: "kcal" 
        },
        protein: { 
          current: prev.protein.current, 
          target: profile.initial_recommended_protein_g || 120 
        },
        carbs: { 
          current: prev.carbs.current, 
          target: profile.initial_recommended_carbs_g || 200 
        },
        fats: { 
          current: prev.fats.current, 
          target: profile.initial_recommended_fats_g || 65 
        }
      }));
    }
  }, [profile?.initial_recommended_calories, profile?.initial_recommended_protein_g, profile?.initial_recommended_carbs_g, profile?.initial_recommended_fats_g]);

  // Load daily food consumption
  const fetchDailyFoodConsumption = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const dateString = getLocalDateString(selectedDate);
      
      const { data: foodEntries, error } = await supabase
        .from('daily_food_log_entries')
        .select('calories_consumed, protein_g_consumed, carbs_g_consumed, fat_g_consumed')
        .eq('user_id', user.id)
        .eq('log_date', dateString);
        
      if (error) throw error;
      
      // Calculate totals from food entries
      const totals = (foodEntries || []).reduce(
        (sum, entry) => ({
          calories: sum.calories + (entry.calories_consumed || 0),
          protein: sum.protein + (entry.protein_g_consumed || 0),
          carbs: sum.carbs + (entry.carbs_g_consumed || 0),
          fats: sum.fats + (entry.fat_g_consumed || 0)
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );
      
      // Update macros with real consumption data
      setMacros(prev => ({
        calories: { 
          current: Math.round(totals.calories), 
          target: prev.calories.target, 
          unit: "kcal" 
        },
        protein: { 
          current: Math.round(totals.protein), 
          target: prev.protein.target 
        },
        carbs: { 
          current: Math.round(totals.carbs), 
          target: prev.carbs.target 
        },
        fats: { 
          current: Math.round(totals.fats), 
          target: prev.fats.target 
        }
      }));
      
    } catch (error) {
      console.error("Error loading daily food consumption:", error);
    }
  }, [user?.id, selectedDate, getLocalDateString]);

  // Load workout dates using local timezone
  const fetchWorkoutDates = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('workout_date')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Convert server dates to user's local dates
        const dates = data.map(item => {
          const serverDate = new Date(item.workout_date);
          // Create a new date that represents the local date without timezone conversion
          return new Date(serverDate.getTime() + (serverDate.getTimezoneOffset() * 60000));
        });
        setDatesWithWorkouts(dates);
      }
    } catch (error) {
      console.error("Error loading workout dates:", error);
    }
  }, [user?.id]);

  // Load daily workouts using local timezone range
  const fetchDailyWorkouts = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Use local timezone date range for the user
      const { startOfDay, endOfDay } = getLocalDayRange(selectedDate);
      
      console.log(`Fetching workouts for local date range: ${startOfDay} to ${endOfDay}`);
      
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
        .gte('workout_date', startOfDay)
        .lte('workout_date', endOfDay)
        .order('workout_date', { ascending: false });
        
      if (error) throw error;
      
      console.log(`Found ${workoutLogs?.length || 0} workouts for the selected date`);
      
      if (workoutLogs && workoutLogs.length > 0) {
        const workouts = workoutLogs.map(workout => {
          const exerciseNames = Array.from(
            new Set(
              workout.workout_log_exercise_details
                .map((detail: any) => detail.exercise_name_snapshot)
            )
          );
          
          // Use actual workout duration, only estimate if null or 0
          let duration = workout.duration_completed_minutes;
          if (!duration || duration === 0) {
            duration = Math.max(15, exerciseNames.length * 3);
          }
          
          let calories = workout.calories_burned_estimated;
          if (!calories || calories === 0) {
            calories = Math.round(duration * 6);
          }
          
          return {
            id: workout.id,
            name: workout.routine_name_snapshot || "Entrenamiento",
            duration: `${duration} min`,
            calories: calories,
            date: workout.workout_date,
            exercises: exerciseNames.slice(0, 3), // Show only first 3
            exerciseCount: exerciseNames.length,
            totalSets: workout.workout_log_exercise_details.length
          };
        });
        
        setWorkoutSummaries(workouts);
        setHasCompletedWorkout(true);
      } else {
        setWorkoutSummaries([]);
        setHasCompletedWorkout(false);
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
      setHasCompletedWorkout(false);
      setWorkoutSummaries([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedDate, getLocalDayRange]);

  // Effect for loading food consumption
  useEffect(() => {
    fetchDailyFoodConsumption();
  }, [fetchDailyFoodConsumption]);

  // Effect for loading workout dates (only once)
  useEffect(() => {
    fetchWorkoutDates();
  }, [fetchWorkoutDates]);

  // Effect for loading daily workouts
  useEffect(() => {
    fetchDailyWorkouts();
  }, [fetchDailyWorkouts]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return {
    selectedDate,
    hasCompletedWorkout,
    workoutSummaries,
    loading,
    datesWithWorkouts,
    macros,
    handleDateSelect
  };
};
