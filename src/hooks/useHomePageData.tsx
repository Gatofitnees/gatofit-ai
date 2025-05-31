import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface WorkoutSummary {
  id: number;
  routine_name_snapshot: string | null;
  duration_completed_minutes: number | null;
  calories_burned_estimated: number | null;
  workout_date: string;
  exercise_count: number;
}

interface MacroData {
  calories: { current: number; target: number; unit: string };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
}

export const useHomePageData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayWorkout, setTodayWorkout] = useState<WorkoutSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);
  const [datesWithWorkouts, setDatesWithWorkouts] = useState<Date[]>([]);
  const [macros, setMacros] = useState<MacroData>({
    calories: { current: 0, target: 2000, unit: "kcal" },
    protein: { current: 0, target: 120 },
    carbs: { current: 0, target: 200 },
    fats: { current: 0, target: 65 }
  });

  // Fetch macros data for selected date
  const fetchMacrosForDate = async (date: Date) => {
    if (!user) return;

    try {
      const dateString = date.toISOString().split('T')[0];
      
      // Get food entries for the selected date
      const { data: foodEntries, error } = await supabase
        .from('daily_food_log_entries')
        .select('calories_consumed, protein_g_consumed, carbs_g_consumed, fat_g_consumed')
        .eq('user_id', user.id)
        .eq('log_date', dateString);

      if (error) throw error;

      // Calculate totals
      const totals = foodEntries?.reduce((acc, entry) => ({
        calories: acc.calories + (entry.calories_consumed || 0),
        protein: acc.protein + (entry.protein_g_consumed || 0),
        carbs: acc.carbs + (entry.carbs_g_consumed || 0),
        fats: acc.fats + (entry.fat_g_consumed || 0)
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 }) || { calories: 0, protein: 0, carbs: 0, fats: 0 };

      // Get user's macro targets (you might want to implement this)
      // For now using default values
      setMacros({
        calories: { current: Math.round(totals.calories), target: 2000, unit: "kcal" },
        protein: { current: Math.round(totals.protein), target: 120 },
        carbs: { current: Math.round(totals.carbs), target: 200 },
        fats: { current: Math.round(totals.fats), target: 65 }
      });

    } catch (error) {
      console.error("Error fetching macros:", error);
      // Keep default values on error
    }
  };

  // Fetch workout dates for the calendar
  useEffect(() => {
    const fetchWorkoutDates = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('workout_logs')
          .select('workout_date')
          .eq('user_id', user.id)
          .order('workout_date', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const dates = data.map(item => new Date(item.workout_date));
          setDatesWithWorkouts(dates);
        }
      } catch (error) {
        console.error("Error al cargar fechas de entrenamientos:", error);
      }
    };
    
    fetchWorkoutDates();
  }, [user]);
  
  // Fetch workout data for selected date
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get date range for the selected date
        const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
        
        console.log(`Fetching workouts between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
        
        // Fetch workouts with exercise details count using explicit foreign key reference
        const { data: workouts, error } = await supabase
          .from('workout_logs')
          .select(`
            id,
            routine_name_snapshot,
            duration_completed_minutes,
            calories_burned_estimated,
            workout_date,
            workout_log_exercise_details:workout_log_exercise_details!workout_log_exercise_details_workout_log_id_fkey(id)
          `)
          .eq('user_id', user.id)
          .gte('workout_date', startOfDay.toISOString())
          .lt('workout_date', endOfDay.toISOString())
          .order('workout_date', { ascending: false });
          
        if (error) {
          console.error("Error en la consulta:", error);
          throw error;
        }
        
        console.log("Workouts fetched:", workouts?.length || 0);
        
        if (workouts && workouts.length > 0) {
          // Transform data to include exercise count
          const formattedWorkouts = workouts.map(workout => ({
            id: workout.id,
            routine_name_snapshot: workout.routine_name_snapshot,
            duration_completed_minutes: workout.duration_completed_minutes,
            calories_burned_estimated: workout.calories_burned_estimated,
            workout_date: workout.workout_date,
            exercise_count: Array.isArray(workout.workout_log_exercise_details) 
              ? workout.workout_log_exercise_details.length 
              : 0
          }));
          
          setTodayWorkout(formattedWorkouts[0]);
          setRecentWorkouts(formattedWorkouts);
        } else {
          setTodayWorkout(null);
          setRecentWorkouts([]);
        }
      } catch (error: any) {
        console.error("Error al cargar el entrenamiento:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del entrenamiento",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    fetchMacrosForDate(selectedDate);
  }, [selectedDate, toast, user]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Determine if user has completed workout
  const hasCompletedWorkout = todayWorkout !== null;
  
  // Use todayWorkout as workoutSummary for compatibility
  const workoutSummary = todayWorkout ? {
    id: todayWorkout.id,
    name: todayWorkout.routine_name_snapshot || "Entrenamiento",
    duration: `${todayWorkout.duration_completed_minutes || 0} min`,
    calories: todayWorkout.calories_burned_estimated || 0,
    date: todayWorkout.workout_date,
    exercises: [], // This would need to be populated from exercise details if needed
    exerciseCount: todayWorkout.exercise_count
  } : undefined;
  
  return {
    loading,
    selectedDate,
    hasCompletedWorkout,
    workoutSummary,
    todayWorkout,
    recentWorkouts,
    datesWithWorkouts,
    macros,
    handleDateSelect
  };
};
