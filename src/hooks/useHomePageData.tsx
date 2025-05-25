
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkoutSummary {
  id: number;
  routine_name_snapshot: string | null;
  duration_completed_minutes: number | null;
  calories_burned_estimated: number | null;
  workout_date: string;
  exercise_count: number;
}

export const useHomePageData = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get today's date range in user's timezone
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
        
        console.log(`Fetching workouts between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
        
        // Fetch today's workouts with exercise details count
        const { data: workouts, error } = await supabase
          .from('workout_logs')
          .select(`
            id,
            routine_name_snapshot,
            duration_completed_minutes,
            calories_burned_estimated,
            workout_date,
            workout_log_exercise_details!workout_log_exercise_details_workout_log_id_fkey(id)
          `)
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
  }, [toast]);
  
  return {
    loading,
    todayWorkout,
    recentWorkouts
  };
};
