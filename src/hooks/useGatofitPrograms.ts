
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GatofitProgram {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  duration_weeks: number;
  difficulty_level: string;
  program_type: string;
  target_audience?: string;
  estimated_sessions_per_week?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GatofitProgramWeek {
  id: string;
  program_id: string;
  week_number: number;
  week_name?: string;
  week_description?: string;
  focus_areas?: string[];
  created_at: string;
}

export interface GatofitProgramExercise {
  id: string;
  program_id: string;
  week_number: number;
  day_of_week: number;
  exercise_id: number;
  sets?: number;
  reps_min?: number;
  reps_max?: number;
  rest_seconds?: number;
  notes?: string;
  order_in_day: number;
  created_at: string;
  exercise?: {
    id: number;
    name: string;
    muscle_group_main?: string;
    equipment_required?: string;
  };
}

export interface GatofitProgramRoutine {
  id: string;
  program_id: string;
  week_number: number;
  day_of_week: number;
  routine_id: number;
  notes?: string;
  order_in_day: number;
  created_at: string;
  routine?: {
    id: number;
    name: string;
    type?: string;
    estimated_duration_minutes?: number;
    description?: string;
  };
}

export interface UserGatofitProgress {
  id: string;
  user_id: string;
  program_id: string;
  started_at: string;
  current_week: number;
  current_day: number;
  is_active: boolean;
  completion_percentage: number;
  last_workout_date?: string;
  completed_at?: string;
  program?: GatofitProgram;
}

export const useGatofitPrograms = () => {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<GatofitProgram[]>([]);
  const [userProgress, setUserProgress] = useState<UserGatofitProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gatofit_programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      console.error("Error fetching Gatofit programs:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los programas Gatofit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUserProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_gatofit_program_progress')
        .select(`
          *,
          program:program_id (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error: any) {
      console.error("Error fetching user progress:", error);
    }
  }, []);

  const startProgram = async (programId: string, startDate?: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Pausar cualquier programa activo
      await supabase
        .from('user_gatofit_program_progress')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Verificar si ya existe un registro para este programa
      const { data: existingProgress } = await supabase
        .from('user_gatofit_program_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .single();

      if (existingProgress) {
        // Reactivar programa existente
        const { error } = await supabase
          .from('user_gatofit_program_progress')
          .update({
            is_active: true,
            started_at: startDate?.toISOString() || new Date().toISOString(),
            current_week: 1,
            current_day: 0,
            completion_percentage: 0
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Crear nuevo registro
        const { error } = await supabase
          .from('user_gatofit_program_progress')
          .insert({
            user_id: user.id,
            program_id: programId,
            started_at: startDate?.toISOString() || new Date().toISOString(),
            current_week: 1,
            current_day: 0,
            is_active: true,
            completion_percentage: 0
          });

        if (error) throw error;
      }

      await fetchUserProgress();
      
      toast({
        title: "¡Programa iniciado!",
        description: "Has comenzado tu nuevo programa Gatofit",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error starting program:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el programa",
        variant: "destructive"
      });
      return false;
    }
  };

  const pauseProgram = async (progressId: string) => {
    try {
      const { error } = await supabase
        .from('user_gatofit_program_progress')
        .update({ is_active: false })
        .eq('id', progressId);

      if (error) throw error;

      await fetchUserProgress();
      
      toast({
        title: "Programa pausado",
        description: "El programa ha sido pausado correctamente",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error pausing program:", error);
      toast({
        title: "Error",
        description: "No se pudo pausar el programa",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProgress = async (progressId: string, currentWeek: number, currentDay: number, completionPercentage: number) => {
    try {
      const { error } = await supabase
        .from('user_gatofit_program_progress')
        .update({
          current_week: currentWeek,
          current_day: currentDay,
          completion_percentage: completionPercentage,
          last_workout_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', progressId);

      if (error) throw error;

      await fetchUserProgress();
      return true;
    } catch (error: any) {
      console.error("Error updating progress:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchUserProgress();
  }, [fetchPrograms, fetchUserProgress]);

  return {
    programs,
    userProgress,
    loading,
    fetchPrograms,
    fetchUserProgress,
    startProgram,
    pauseProgram,
    updateProgress
  };
};

export const useGatofitProgramDetail = (programId?: string) => {
  const { toast } = useToast();
  const [program, setProgram] = useState<GatofitProgram | null>(null);
  const [weeks, setWeeks] = useState<GatofitProgramWeek[]>([]);
  const [exercises, setExercises] = useState<GatofitProgramExercise[]>([]);
  const [routines, setRoutines] = useState<GatofitProgramRoutine[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProgramDetail = useCallback(async () => {
    if (!programId) return;

    try {
      setLoading(true);
      
      // Fetch program info
      const { data: programData, error: programError } = await supabase
        .from('gatofit_programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (programError) throw programError;
      setProgram(programData);

      // Fetch weeks
      const { data: weeksData, error: weeksError } = await supabase
        .from('gatofit_program_weeks')
        .select('*')
        .eq('program_id', programId)
        .order('week_number');

      if (weeksError) throw weeksError;
      setWeeks(weeksData || []);

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('gatofit_program_exercises')
        .select(`
          *,
          exercise:exercise_id (
            id,
            name,
            muscle_group_main,
            equipment_required
          )
        `)
        .eq('program_id', programId)
        .order('week_number')
        .order('day_of_week')
        .order('order_in_day');

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData || []);

      // Fetch routines - Manual query since table is not in types
      try {
        const routinesQuery = `
          SELECT 
            gpr.*,
            r.name as routine_name,
            r.type as routine_type,
            r.estimated_duration_minutes,
            r.description as routine_description
          FROM gatofit_program_routines gpr
          LEFT JOIN routines r ON gpr.routine_id = r.id
          WHERE gpr.program_id = $1
          ORDER BY gpr.week_number, gpr.day_of_week, gpr.order_in_day
        `;
        
        const { data: routinesRawData, error: routinesRawError } = await supabase
          .rpc('execute_raw_sql' as any, { 
            query: routinesQuery,
            params: [programId]
          });

        if (routinesRawError) {
          console.warn('Error fetching routines with function, trying direct approach:', routinesRawError);
          // Fallback: fetch basic routines data and routine details separately
          const { data: basicRoutines } = await supabase
            .from('gatofit_program_routines' as any)
            .select('*')
            .eq('program_id', programId)
            .order('week_number')
            .order('day_of_week')
            .order('order_in_day');

          if (basicRoutines && basicRoutines.length > 0) {
            // Get routine details for each routine
            const routineIds = [...new Set(basicRoutines.map((r: any) => r.routine_id))];
            const { data: routineDetails } = await supabase
              .from('routines')
              .select('id, name, type, estimated_duration_minutes, description')
              .in('id', routineIds);

            // Combine the data
            const combinedRoutines = basicRoutines.map((programRoutine: any) => ({
              ...programRoutine,
              routine: routineDetails?.find((r: any) => r.id === programRoutine.routine_id)
            }));
            
            setRoutines(combinedRoutines);
          } else {
            setRoutines([]);
          }
        } else {
          // Transform the raw data to match our interface
          const transformedRoutines = routinesRawData?.map((item: any) => ({
            id: item.id,
            program_id: item.program_id,
            week_number: item.week_number,
            day_of_week: item.day_of_week,
            routine_id: item.routine_id,
            notes: item.notes,
            order_in_day: item.order_in_day,
            created_at: item.created_at,
            routine: {
              id: item.routine_id,
              name: item.routine_name,
              type: item.routine_type,
              estimated_duration_minutes: item.estimated_duration_minutes,
              description: item.routine_description
            }
          })) || [];
          
          setRoutines(transformedRoutines);
        }
      } catch (routineError) {
        console.error('Error in routine fetching:', routineError);
        setRoutines([]);
      }

    } catch (error: any) {
      console.error("Error fetching program detail:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del programa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [programId, toast]);

  useEffect(() => {
    fetchProgramDetail();
  }, [fetchProgramDetail]);

  return {
    program,
    weeks,
    exercises,
    routines,
    loading,
    fetchProgramDetail
  };
};
