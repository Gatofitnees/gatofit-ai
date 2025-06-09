
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";

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

  // Generate macros data from profile or defaults
  const macros: MacroData = {
    calories: { 
      current: 0, // This would come from daily food log
      target: profile?.initial_recommended_calories || 2000, 
      unit: "kcal" 
    },
    protein: { 
      current: 0, // This would come from daily food log
      target: profile?.initial_recommended_protein_g || 120 
    },
    carbs: { 
      current: 0, // This would come from daily food log
      target: profile?.initial_recommended_carbs_g || 200 
    },
    fats: { 
      current: 0, // This would come from daily food log
      target: profile?.initial_recommended_fats_g || 65 
    }
  };

  // Load workout dates
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
        console.error("Error loading workout dates:", error);
      }
    };
    
    fetchWorkoutDates();
  }, [user]);

  // Load daily workouts
  useEffect(() => {
    const fetchDailyWorkouts = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        
        // Use date range instead of like operator
        const startOfDay = `${dateString}T00:00:00`;
        const endOfDay = `${dateString}T23:59:59`;
        
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
        
        if (workoutLogs && workoutLogs.length > 0) {
          const workouts = workoutLogs.map(workout => {
            const exerciseNames = Array.from(
              new Set(
                workout.workout_log_exercise_details
                  .map((detail: any) => detail.exercise_name_snapshot)
              )
            );
            
            // Usar la duración real del entrenamiento, solo estimar si es null o 0
            let duration = workout.duration_completed_minutes;
            if (!duration || duration === 0) {
              // Solo estimar si realmente no hay datos
              duration = Math.max(15, exerciseNames.length * 3);
            }
            
            // Usar las calorías reales del entrenamiento, solo estimar si es null o 0
            let calories = workout.calories_burned_estimated;
            if (!calories || calories === 0) {
              // Solo estimar si realmente no hay datos
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
    };
    
    fetchDailyWorkouts();
  }, [user, selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

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
