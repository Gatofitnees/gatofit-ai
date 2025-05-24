
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface WorkoutSummary {
  id: number;
  name: string;
  duration: string;
  calories: number;
  date: string;
  exercises: string[];
  exerciseCount: number;
  totalSets: number;
}

export function useHomePageData() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasCompletedWorkout, setHasCompletedWorkout] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [datesWithWorkouts, setDatesWithWorkouts] = useState<Date[]>([]);
  
  // Example data for macros - would come from Supabase in a real implementation
  const macros = {
    calories: { current: 1450, target: 2000, unit: "kcal" },
    protein: { current: 90, target: 120 },
    carbs: { current: 130, target: 200 },
    fats: { current: 35, target: 65 }
  };

  // Load the dates with workouts
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

  // Load workout data for the selected date
  useEffect(() => {
    const fetchDailyWorkout = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Format date as YYYY-MM-DD for start of day
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        // Format date as YYYY-MM-DD for end of day
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        console.log(`Fetching workouts between ${startDate.toISOString()} and ${endDate.toISOString()}`);
        
        // Get workout logs for the selected date using date range instead of LIKE
        const { data: workoutLogs, error } = await supabase
          .from('workout_logs')
          .select(`
            id,
            routine_name_snapshot,
            duration_completed_minutes,
            calories_burned_estimated,
            workout_date,
            workout_log_exercise_details(
              exercise_name_snapshot,
              set_number,
              weight_kg_used,
              reps_completed
            )
          `)
          .eq('user_id', user.id)
          .gte('workout_date', startDate.toISOString())
          .lt('workout_date', endDate.toISOString())
          .order('workout_date', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error en la consulta:", error);
          throw error;
        }
        
        console.log("Resultado de la consulta:", workoutLogs);
        
        if (workoutLogs && workoutLogs.length > 0) {
          const workout = workoutLogs[0];
          
          // Extract unique exercise names and calculate totals
          const exerciseNames = Array.from(
            new Set(
              workout.workout_log_exercise_details
                .map((detail: any) => detail.exercise_name_snapshot)
            )
          );
          
          // Calculate total sets performed
          const totalSets = workout.workout_log_exercise_details.length;
          
          // Get top 3 exercises for display
          const topExercises = exerciseNames.slice(0, 3);
          
          setWorkoutSummary({
            id: workout.id,
            name: workout.routine_name_snapshot || "Entrenamiento",
            duration: `${workout.duration_completed_minutes || 0} min`,
            calories: workout.calories_burned_estimated || 0,
            date: workout.workout_date,
            exercises: topExercises,
            exerciseCount: exerciseNames.length,
            totalSets: totalSets
          });
          setHasCompletedWorkout(true);
        } else {
          setWorkoutSummary(undefined);
          setHasCompletedWorkout(false);
        }
      } catch (error) {
        console.error("Error al cargar el entrenamiento:", error);
        setHasCompletedWorkout(false);
        setWorkoutSummary(undefined);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyWorkout();
  }, [user, selectedDate]);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return {
    selectedDate,
    hasCompletedWorkout,
    workoutSummary,
    loading,
    datesWithWorkouts,
    macros,
    handleDateSelect
  };
}
