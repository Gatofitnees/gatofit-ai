
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeeklyProgram, WeeklyProgramRoutine } from "./useWeeklyPrograms";
import { useLocalTimezone } from "./useLocalTimezone";

export const useActiveProgramForSelectedDate = (selectedDate: Date) => {
  const { toast } = useToast();
  const [activeProgram, setActiveProgram] = useState<WeeklyProgram | null>(null);
  const [dayRoutines, setDayRoutines] = useState<WeeklyProgramRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasCompletedWorkout, setHasCompletedWorkout] = useState(false);
  const { getLocalDayRange } = useLocalTimezone();

  const fetchActiveProgramForSelectedDate = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setActiveProgram(null);
        setDayRoutines([]);
        setHasCompletedWorkout(false);
        return;
      }

      // Get active program
      const { data: programs, error: programError } = await supabase
        .from('weekly_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (programError) throw programError;

      if (!programs || programs.length === 0) {
        setActiveProgram(null);
        setDayRoutines([]);
        setHasCompletedWorkout(false);
        return;
      }

      const program = programs[0];
      setActiveProgram(program);

      // Get selected day's day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = selectedDate.getDay();

      // Get routines for selected day
      const { data: routines, error: routinesError } = await supabase
        .from('weekly_program_routines')
        .select(`
          *,
          routine:routine_id (
            id,
            name,
            type,
            estimated_duration_minutes
          )
        `)
        .eq('program_id', program.id)
        .eq('day_of_week', dayOfWeek)
        .order('order_in_day');

      if (routinesError) throw routinesError;

      setDayRoutines(routines || []);

      // Check if there are completed workouts for the selected date
      const dayRange = getLocalDayRange(selectedDate);
      const { data: workoutLogs, error: workoutError } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', user.id)
        .gte('workout_date', dayRange.startOfDay)
        .lte('workout_date', dayRange.endOfDay)
        .limit(1);

      if (workoutError) throw workoutError;

      setHasCompletedWorkout((workoutLogs || []).length > 0);

    } catch (error: any) {
      console.error("Error fetching active program for selected date:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la programación activa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast, getLocalDayRange]);

  useEffect(() => {
    fetchActiveProgramForSelectedDate();
  }, [fetchActiveProgramForSelectedDate]);

  return {
    activeProgram,
    dayRoutines,
    loading,
    hasCompletedWorkout,
    refetch: fetchActiveProgramForSelectedDate
  };
};
