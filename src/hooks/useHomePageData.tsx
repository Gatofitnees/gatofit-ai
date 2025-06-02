
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

interface WorkoutSummary {
  id: number;
  name: string;
  duration: string;
  calories: number;
  date: string;
  exercises: string[];
}

export const useHomePageData = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasCompletedWorkout, setHasCompletedWorkout] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [datesWithWorkouts, setDatesWithWorkouts] = useState<Date[]>([]);
  
  // Calculate today's totals from actual food entries
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

  // Fetch food log data for today
  useEffect(() => {
    const fetchTodaysFoodData = async () => {
      if (!user) return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: entries, error } = await supabase
          .from('daily_food_log_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today);
          
        if (error) throw error;
        
        if (entries && entries.length > 0) {
          const totals = entries.reduce(
            (acc, entry) => ({
              calories: acc.calories + entry.calories_consumed,
              protein: acc.protein + entry.protein_g_consumed,
              carbs: acc.carbs + entry.carbs_g_consumed,
              fat: acc.fat + entry.fat_g_consumed
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          );
          
          setTodayTotals(totals);
        } else {
          setTodayTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        }
      } catch (error) {
        console.error("Error fetching today's food data:", error);
        setTodayTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    };
    
    fetchTodaysFoodData();
  }, [user]);

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
        console.error("Error al cargar fechas de entrenamientos:", error);
      }
    };
    
    fetchWorkoutDates();
  }, [user]);

  // Load workout data for selected date
  useEffect(() => {
    const fetchDailyWorkout = async () => {
      if (!user) return;
      
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
        console.error("Error al cargar el entrenamiento:", error);
        setHasCompletedWorkout(false);
        setWorkoutSummary(undefined);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyWorkout();
  }, [user, selectedDate]);

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
};
