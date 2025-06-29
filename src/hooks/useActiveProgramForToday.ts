
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeeklyProgram, WeeklyProgramRoutine } from "./useWeeklyPrograms";

export const useActiveProgramForToday = () => {
  const { toast } = useToast();
  const [activeProgram, setActiveProgram] = useState<WeeklyProgram | null>(null);
  const [todayRoutines, setTodayRoutines] = useState<WeeklyProgramRoutine[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActiveProgramForToday = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setActiveProgram(null);
        setTodayRoutines([]);
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
        return;
      }

      const program = programs[0];
      setActiveProgram(program);

      // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
      const today = new Date();
      const dayOfWeek = today.getDay();

      // Get routines for today
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
    } catch (error: any) {
      console.error("Error fetching active program for today:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la programación activa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchActiveProgramForToday();
  }, [fetchActiveProgramForToday]);

  return {
    activeProgram,
    todayRoutines,
    loading,
    refetch: fetchActiveProgramForToday
  };
};
