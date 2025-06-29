
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeeklyProgramRoutine } from "./useWeeklyPrograms";

export const useWeeklyProgramRoutines = (programId?: string) => {
  const { toast } = useToast();
  const [routines, setRoutines] = useState<WeeklyProgramRoutine[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProgramRoutines = useCallback(async () => {
    if (!programId) {
      setRoutines([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
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
        .eq('program_id', programId)
        .order('day_of_week')
        .order('order_in_day');

      if (error) throw error;
      
      setRoutines(data || []);
    } catch (error: any) {
      console.error("Error fetching program routines:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutinas de la programación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [programId, toast]);

  const addRoutineToProgram = async (routineId: number, dayOfWeek: number, orderInDay: number = 0) => {
    if (!programId) return false;

    try {
      const { error } = await supabase
        .from('weekly_program_routines')
        .insert({
          program_id: programId,
          routine_id: routineId,
          day_of_week: dayOfWeek,
          order_in_day: orderInDay
        });

      if (error) throw error;

      await fetchProgramRoutines();
      return true;
    } catch (error: any) {
      console.error("Error adding routine to program:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la rutina a la programación",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeRoutineFromProgram = async (programRoutineId: string) => {
    try {
      const { error } = await supabase
        .from('weekly_program_routines')
        .delete()
        .eq('id', programRoutineId);

      if (error) throw error;

      await fetchProgramRoutines();
      return true;
    } catch (error: any) {
      console.error("Error removing routine from program:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina de la programación",
        variant: "destructive"
      });
      return false;
    }
  };

  const moveRoutine = async (programRoutineId: string, newDayOfWeek: number, newOrderInDay: number) => {
    try {
      const { error } = await supabase
        .from('weekly_program_routines')
        .update({
          day_of_week: newDayOfWeek,
          order_in_day: newOrderInDay
        })
        .eq('id', programRoutineId);

      if (error) throw error;

      await fetchProgramRoutines();
      return true;
    } catch (error: any) {
      console.error("Error moving routine:", error);
      toast({
        title: "Error",
        description: "No se pudo mover la rutina",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProgramRoutines();
  }, [fetchProgramRoutines]);

  return {
    routines,
    loading,
    fetchProgramRoutines,
    addRoutineToProgram,
    removeRoutineFromProgram,
    moveRoutine
  };
};
