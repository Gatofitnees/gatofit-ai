import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WeeklyProgram {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  program_type: 'simple' | 'advanced';
  start_date?: string;
  current_week: number;
  total_weeks: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklyProgramRoutine {
  id: string;
  program_id: string;
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

export const useWeeklyPrograms = () => {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPrograms([]);
        return;
      }

      const { data, error } = await supabase
        .from('weekly_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast program_type to ensure type safety
      const typedPrograms = (data || []).map(program => ({
        ...program,
        program_type: (program.program_type || 'simple') as 'simple' | 'advanced'
      }));
      
      setPrograms(typedPrograms);
    } catch (error: any) {
      console.error("Error fetching weekly programs:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las programaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createProgram = async (
    name: string, 
    description?: string, 
    programType: 'simple' | 'advanced' = 'simple',
    totalWeeks: number = 1
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('weekly_programs')
        .insert({
          name,
          description,
          user_id: user.id,
          is_active: false,
          program_type: programType,
          total_weeks: totalWeeks,
          current_week: 1
        })
        .select()
        .single();

      if (error) throw error;

      await fetchPrograms();
      return {
        ...data,
        program_type: data.program_type as 'simple' | 'advanced'
      };
    } catch (error: any) {
      console.error("Error creating program:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la programación",
        variant: "destructive"
      });
      return null;
    }
  };

  const addRoutineToProgram = async (programId: string, routineId: number, dayOfWeek: number, orderInDay: number = 0) => {
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

  const updateProgram = async (programId: string, updates: Partial<WeeklyProgram>) => {
    try {
      const { error } = await supabase
        .from('weekly_programs')
        .update(updates)
        .eq('id', programId);

      if (error) throw error;

      await fetchPrograms();
      return true;
    } catch (error: any) {
      console.error("Error updating program:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la programación",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteProgram = async (programId: string) => {
    try {
      const { error } = await supabase
        .from('weekly_programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;

      await fetchPrograms();
      
      toast({
        title: "Programación eliminada",
        description: "La programación ha sido eliminada correctamente",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting program:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la programación",
        variant: "destructive"
      });
      return false;
    }
  };

  const setActiveProgram = async (programId: string, startDate?: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // First, deactivate all programs
      await supabase
        .from('weekly_programs')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Then activate the selected program
      const updateData: any = { is_active: true };
      if (startDate) {
        updateData.start_date = startDate.toISOString().split('T')[0];
        updateData.current_week = 1;
      }

      const { error } = await supabase
        .from('weekly_programs')
        .update(updateData)
        .eq('id', programId);

      if (error) throw error;

      await fetchPrograms();
      
      toast({
        title: "Programación activada",
        description: "La programación ha sido activada correctamente",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error setting active program:", error);
      toast({
        title: "Error",
        description: "No se pudo activar la programación",
        variant: "destructive"
      });
      return false;
    }
  };

  const pauseProgram = async (programId: string) => {
    try {
      const { error } = await supabase
        .from('weekly_programs')
        .update({ is_active: false })
        .eq('id', programId);

      if (error) throw error;

      await fetchPrograms();
      
      toast({
        title: "Programación pausada",
        description: "La programación ha sido pausada correctamente",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error pausing program:", error);
      toast({
        title: "Error",
        description: "No se pudo pausar la programación",
        variant: "destructive"
      });
      return false;
    }
  };

  // Helper function to get the current week for a program
  const getCurrentWeekForProgram = (program: WeeklyProgram): number => {
    if (program.program_type === 'simple' || !program.start_date) {
      return 1;
    }

    const startDate = new Date(program.start_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    return Math.min(diffWeeks + 1, program.total_weeks);
  };

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return {
    programs,
    loading,
    fetchPrograms,
    createProgram,
    addRoutineToProgram,
    updateProgram,
    deleteProgram,
    setActiveProgram,
    pauseProgram,
    getCurrentWeekForProgram
  };
};
