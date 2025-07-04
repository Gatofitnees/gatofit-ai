
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeeklyProgram, WeeklyProgramRoutine } from "./useWeeklyPrograms";

export const useActiveProgramForSelectedDate = (selectedDate: Date) => {
  const { toast } = useToast();
  const [activeProgram, setActiveProgram] = useState<WeeklyProgram | null>(null);
  const [todayRoutines, setTodayRoutines] = useState<WeeklyProgramRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCompletedForSelectedDate, setIsCompletedForSelectedDate] = useState(false);

  const fetchActiveProgramForSelectedDate = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setActiveProgram(null);
        setTodayRoutines([]);
        setIsCompletedForSelectedDate(false);
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
        setTodayRoutines([]);
        setIsCompletedForSelectedDate(false);
        return;
      }

      const program = {
        ...programs[0],
        program_type: (programs[0].program_type || 'simple') as 'simple' | 'advanced'
      };
      setActiveProgram(program);

      // Get day of week for selected date (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = selectedDate.getDay();

      // Get routines for the selected day
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

      setTodayRoutines(routines || []);

      // Check if programmed routines for this date are already completed
      if (routines && routines.length > 0) {
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        
        const { data: workoutLogs, error: workoutError } = await supabase
          .from('workout_logs')
          .select('routine_id')
          .eq('user_id', user.id)
          .gte('workout_date', `${selectedDateString}T00:00:00.000Z`)
          .lte('workout_date', `${selectedDateString}T23:59:59.999Z`);

        if (workoutError) throw workoutError;

        const completedRoutineIds = new Set(workoutLogs?.map(log => log.routine_id) || []);
        const programmedRoutineIds = routines.map(r => r.routine_id);
        
        // Check if at least one programmed routine was completed
        const hasCompletedProgrammedRoutine = programmedRoutineIds.some(id => 
          completedRoutineIds.has(id)
        );
        
        setIsCompletedForSelectedDate(hasCompletedProgrammedRoutine);
      } else {
        setIsCompletedForSelectedDate(false);
      }
    } catch (error: any) {
      console.error("Error fetching active program for selected date:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la programación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => {
    fetchActiveProgramForSelectedDate();
  }, [fetchActiveProgramForSelectedDate]);

  const isCurrentDay = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  return {
    activeProgram,
    todayRoutines,
    loading,
    isCompletedForSelectedDate,
    isCurrentDay: isCurrentDay(),
    refetch: fetchActiveProgramForSelectedDate
  };
};
