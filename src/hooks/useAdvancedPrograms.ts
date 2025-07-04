
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdvancedProgramWeek {
  id: string;
  program_id: string;
  week_number: number;
  week_name?: string;
  week_description?: string;
  created_at: string;
}

export interface AdvancedProgramWeekRoutine {
  id: string;
  program_id: string;
  week_number: number;
  routine_id: number;
  day_of_week: number;
  order_in_day: number;
  created_at: string;
  routine?: {
    id: number;
    name: string;
    type?: string;
    estimated_duration_minutes?: number;
  };
}

export const useAdvancedPrograms = (programId?: string) => {
  const { toast } = useToast();
  const [weeks, setWeeks] = useState<AdvancedProgramWeek[]>([]);
  const [weekRoutines, setWeekRoutines] = useState<AdvancedProgramWeekRoutine[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProgramWeeks = useCallback(async () => {
    if (!programId) {
      setWeeks([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('advanced_program_weeks')
        .select('*')
        .eq('program_id', programId)
        .order('week_number');

      if (error) throw error;
      setWeeks(data || []);
    } catch (error: any) {
      console.error("Error fetching program weeks:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las semanas del programa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [programId, toast]);

  const fetchWeekRoutines = useCallback(async () => {
    if (!programId) {
      setWeekRoutines([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('advanced_program_week_routines')
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
        .order('week_number')
        .order('day_of_week')
        .order('order_in_day');

      if (error) throw error;
      setWeekRoutines(data || []);
    } catch (error: any) {
      console.error("Error fetching week routines:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutinas de las semanas",
        variant: "destructive"
      });
    }
  }, [programId, toast]);

  const createWeek = async (weekNumber: number, weekName?: string, weekDescription?: string) => {
    if (!programId) return false;

    try {
      const { error } = await supabase
        .from('advanced_program_weeks')
        .insert({
          program_id: programId,
          week_number: weekNumber,
          week_name: weekName,
          week_description: weekDescription
        });

      if (error) throw error;

      await fetchProgramWeeks();
      return true;
    } catch (error: any) {
      console.error("Error creating week:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la semana",
        variant: "destructive"
      });
      return false;
    }
  };

  const addRoutineToWeek = async (weekNumber: number, routineId: number, dayOfWeek: number, orderInDay: number = 0) => {
    if (!programId) return false;

    try {
      const { error } = await supabase
        .from('advanced_program_week_routines')
        .insert({
          program_id: programId,
          week_number: weekNumber,
          routine_id: routineId,
          day_of_week: dayOfWeek,
          order_in_day: orderInDay
        });

      if (error) throw error;

      await fetchWeekRoutines();
      return true;
    } catch (error: any) {
      console.error("Error adding routine to week:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la rutina a la semana",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeRoutineFromWeek = async (weekRoutineId: string) => {
    try {
      const { error } = await supabase
        .from('advanced_program_week_routines')
        .delete()
        .eq('id', weekRoutineId);

      if (error) throw error;

      await fetchWeekRoutines();
      return true;
    } catch (error: any) {
      console.error("Error removing routine from week:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina de la semana",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProgramTotalWeeks = async (totalWeeks: number) => {
    if (!programId) return false;

    try {
      const { error } = await supabase
        .from('weekly_programs')
        .update({ total_weeks: totalWeeks })
        .eq('id', programId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Error updating program total weeks:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchProgramWeeks();
    fetchWeekRoutines();
  }, [fetchProgramWeeks, fetchWeekRoutines]);

  return {
    weeks,
    weekRoutines,
    loading,
    fetchProgramWeeks,
    fetchWeekRoutines,
    createWeek,
    addRoutineToWeek,
    removeRoutineFromWeek,
    updateProgramTotalWeeks
  };
};
