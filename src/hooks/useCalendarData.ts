
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WorkoutSummary {
  id: number;
  routine_name_snapshot: string | null;
  duration_completed_minutes: number | null;
  calories_burned_estimated: number | null;
}

interface NutritionSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals_count: number;
}

interface DayActivity {
  date: string;
  workouts: WorkoutSummary[];
  nutrition: NutritionSummary | null;
  experience_gained: number;
  has_workout: boolean;
  has_nutrition: boolean;
}

export const useCalendarData = (selectedDate?: Date) => {
  const { user } = useAuth();
  const [monthData, setMonthData] = useState<Record<string, DayActivity>>({});
  const [selectedDayData, setSelectedDayData] = useState<DayActivity | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonthData = async (date: Date) => {
    if (!user) return;

    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Fetch workouts for the month
      const { data: workouts, error: workoutError } = await supabase
        .from('workout_logs')
        .select('id, routine_name_snapshot, duration_completed_minutes, calories_burned_estimated, workout_date')
        .eq('user_id', user.id)
        .gte('workout_date', startOfMonth.toISOString())
        .lte('workout_date', endOfMonth.toISOString());

      if (workoutError) throw workoutError;

      // Fetch nutrition data for the month
      const { data: nutrition, error: nutritionError } = await supabase
        .from('daily_food_log_entries')
        .select('log_date, calories_consumed, protein_g_consumed, carbs_g_consumed, fat_g_consumed')
        .eq('user_id', user.id)
        .gte('log_date', startOfMonth.toISOString().split('T')[0])
        .lte('log_date', endOfMonth.toISOString().split('T')[0]);

      if (nutritionError) throw nutritionError;

      // Fetch streak data for experience
      const { data: streaks, error: streakError } = await supabase
        .from('user_streaks')
        .select('experience_today, last_xp_date')
        .eq('user_id', user.id)
        .single();

      if (streakError && streakError.code !== 'PGRST116') throw streakError;

      // Process data into daily activities
      const dailyActivities: Record<string, DayActivity> = {};

      // Initialize all days of the month
      for (let d = 1; d <= endOfMonth.getDate(); d++) {
        const dateStr = new Date(date.getFullYear(), date.getMonth(), d).toISOString().split('T')[0];
        dailyActivities[dateStr] = {
          date: dateStr,
          workouts: [],
          nutrition: null,
          experience_gained: 0,
          has_workout: false,
          has_nutrition: false
        };
      }

      // Add workout data
      workouts?.forEach(workout => {
        const dateStr = new Date(workout.workout_date).toISOString().split('T')[0];
        if (dailyActivities[dateStr]) {
          dailyActivities[dateStr].workouts.push({
            id: workout.id,
            routine_name_snapshot: workout.routine_name_snapshot,
            duration_completed_minutes: workout.duration_completed_minutes,
            calories_burned_estimated: workout.calories_burned_estimated
          });
          dailyActivities[dateStr].has_workout = true;
        }
      });

      // Add nutrition data
      const nutritionByDate = nutrition?.reduce((acc, entry) => {
        if (!acc[entry.log_date]) {
          acc[entry.log_date] = {
            total_calories: 0,
            total_protein: 0,
            total_carbs: 0,
            total_fats: 0,
            meals_count: 0
          };
        }
        acc[entry.log_date].total_calories += entry.calories_consumed || 0;
        acc[entry.log_date].total_protein += entry.protein_g_consumed || 0;
        acc[entry.log_date].total_carbs += entry.carbs_g_consumed || 0;
        acc[entry.log_date].total_fats += entry.fat_g_consumed || 0;
        acc[entry.log_date].meals_count += 1;
        return acc;
      }, {} as Record<string, NutritionSummary>) || {};

      Object.keys(nutritionByDate).forEach(dateStr => {
        if (dailyActivities[dateStr]) {
          dailyActivities[dateStr].nutrition = nutritionByDate[dateStr];
          dailyActivities[dateStr].has_nutrition = true;
        }
      });

      // Add experience data (simplified - you might want to store daily experience)
      if (streaks && streaks.last_xp_date) {
        const lastXpDate = streaks.last_xp_date;
        if (dailyActivities[lastXpDate]) {
          dailyActivities[lastXpDate].experience_gained = streaks.experience_today || 0;
        }
      }

      setMonthData(dailyActivities);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectDay = (date: string) => {
    setSelectedDayData(monthData[date] || null);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchMonthData(selectedDate);
    }
  }, [user, selectedDate]);

  return {
    monthData,
    selectedDayData,
    loading,
    selectDay,
    refetch: () => selectedDate && fetchMonthData(selectedDate)
  };
};
