import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeeklyProgram, WeeklyProgramRoutine } from "./useWeeklyPrograms";
import { GatofitProgram, UserGatofitProgress } from "./useGatofitPrograms";

export interface UnifiedProgramData {
  type: 'weekly' | 'gatofit';
  program: WeeklyProgram | GatofitProgram;
  routines: any[]; // Simplified to avoid type complexity
  userProgress?: UserGatofitProgress;
}

export const useActiveProgramUnified = (selectedDate: Date) => {
  const { toast } = useToast();
  const [activeProgram, setActiveProgram] = useState<UnifiedProgramData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCompletedForSelectedDate, setIsCompletedForSelectedDate] = useState(false);

  const calculateGatofitProgramDay = (
    startDate: string,
    selectedDate: Date,
    currentWeek: number,
    currentDay: number
  ) => {
    const start = new Date(startDate);
    const selected = new Date(selectedDate);
    
    // Calcular días transcurridos desde el inicio
    const daysDiff = Math.floor((selected.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return null; // Fecha anterior al inicio
    
    // Para la fecha actual, usar el progreso guardado
    const today = new Date();
    const isToday = selected.toDateString() === today.toDateString();
    
    if (isToday) {
      // Usar el progreso actual para el día de hoy
      // Convertir de sistema Sunday=0 a Monday=0 para la base de datos
      const jsDay = selectedDate.getDay(); // 0=domingo, 1=lunes, etc.
      const dbDay = jsDay === 0 ? 6 : jsDay - 1; // 0=lunes, 6=domingo
      
      return { 
        weekNumber: currentWeek, 
        dayOfWeek: dbDay
      };
    }
    
    // Para otras fechas, calcular basándose en la fecha de inicio
    const weekNumber = Math.floor(daysDiff / 7) + 1;
    const jsDay = selectedDate.getDay();
    const dbDay = jsDay === 0 ? 6 : jsDay - 1; // Convertir a sistema Monday=0
    
    return { weekNumber, dayOfWeek: dbDay };
  };

  const fetchActiveProgramForSelectedDate = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setActiveProgram(null);
        setIsCompletedForSelectedDate(false);
        return;
      }

      // 1. Verificar programa Gatofit activo primero
      const { data: gatofitProgress, error: gatofitError } = await supabase
        .from('user_gatofit_program_progress')
        .select(`
          *,
          program:program_id (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (gatofitError) throw gatofitError;

      if (gatofitProgress && gatofitProgress.length > 0) {
        const progress = gatofitProgress[0];
        console.log('Active Gatofit program found:', progress);
        
        const programDay = calculateGatofitProgramDay(
          progress.started_at,
          selectedDate,
          progress.current_week,
          progress.current_day
        );

        console.log('Calculated program day:', programDay);

        if (programDay) {
          // Obtener rutinas del programa Gatofit para este día
          try {
            console.log('Fetching routines for:', { 
              programId: progress.program_id, 
              week: programDay.weekNumber, 
              day: programDay.dayOfWeek 
            });
            
            // Query directo para obtener rutinas del programa Gatofit usando RPC como fallback
            let gatofitRoutines: any[] = [];
            let gatofitRoutinesError: any = null;
            
            try {
              // Intentar query directo primero
              const { data, error } = await supabase.rpc('execute_raw_sql' as any, {
                query: `
                  SELECT gpr.*, r.id as routine_id, r.name, r.type, r.estimated_duration_minutes, r.description
                  FROM gatofit_program_routines gpr
                  LEFT JOIN routines r ON gpr.routine_id = r.id
                  WHERE gpr.program_id = $1 AND gpr.week_number = $2 AND gpr.day_of_week = $3
                  ORDER BY gpr.order_in_day
                `,
                params: [progress.program_id, programDay.weekNumber, programDay.dayOfWeek]
              });
              
              if (error) throw error;
              
              // Transform the data to match expected structure
              gatofitRoutines = data?.map((item: any) => ({
                ...item,
                routine: {
                  id: item.routine_id,
                  name: item.name,
                  type: item.type,
                  estimated_duration_minutes: item.estimated_duration_minutes,
                  description: item.description
                }
              })) || [];
              
            } catch (rpcError) {
              console.warn('RPC function not available, routines will not be shown for this day');
              gatofitRoutines = [];
              gatofitRoutinesError = rpcError;
            }

            if (gatofitRoutinesError) {
              console.error('Error fetching Gatofit routines:', gatofitRoutinesError);
            }

            console.log('Gatofit routines for day:', gatofitRoutines);

            if (gatofitRoutines && gatofitRoutines.length > 0) {
              // Los datos ya incluyen los detalles de la rutina por el join
              const combinedRoutines = gatofitRoutines;

              // Verificar si las rutinas ya están completadas
              const selectedDateString = selectedDate.toISOString().split('T')[0];
              
              const { data: workoutLogs, error: workoutError } = await supabase
                .from('workout_logs')
                .select('routine_id')
                .eq('user_id', user.id)
                .gte('workout_date', `${selectedDateString}T00:00:00.000Z`)
                .lte('workout_date', `${selectedDateString}T23:59:59.999Z`);

              if (workoutError) throw workoutError;

              const completedRoutineIds = new Set(workoutLogs?.map(log => log.routine_id) || []);
              const programmedRoutineIds = combinedRoutines.map((r: any) => r.routine_id);
              
              const hasCompletedProgrammedRoutine = programmedRoutineIds.some(id => 
                completedRoutineIds.has(id)
              );

              console.log('Setting active Gatofit program with routines:', combinedRoutines);

              setActiveProgram({
                type: 'gatofit',
                program: progress.program,
                routines: combinedRoutines,
                userProgress: progress
              });
              setIsCompletedForSelectedDate(hasCompletedProgrammedRoutine);
              return;
            }
          } catch (routinesError) {
            console.error('Error fetching Gatofit routines:', routinesError);
          }
        }
        
        // Si no hay rutinas para el día seleccionado, aún mostrar el programa
        // pero sin rutinas específicas
        console.log('No routines found for selected day, but program is active');
        setActiveProgram({
          type: 'gatofit',
          program: progress.program,
          routines: [],
          userProgress: progress
        });
        setIsCompletedForSelectedDate(false);
        return;
      }

      // 2. Si no hay programa Gatofit, buscar programa semanal
      const { data: weeklyPrograms, error: weeklyProgramError } = await supabase
        .from('weekly_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (weeklyProgramError) throw weeklyProgramError;

      if (!weeklyPrograms || weeklyPrograms.length === 0) {
        setActiveProgram(null);
        setIsCompletedForSelectedDate(false);
        return;
      }

      const program = {
        ...weeklyPrograms[0],
        program_type: (weeklyPrograms[0].program_type || 'simple') as 'simple' | 'advanced'
      };

      // Obtener día de la semana para fecha seleccionada (0 = domingo, 1 = lunes, etc.)
      const dayOfWeek = selectedDate.getDay();

      // Obtener rutinas para el día seleccionado
      const { data: weeklyRoutines, error: weeklyRoutinesError } = await supabase
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

      if (weeklyRoutinesError) throw weeklyRoutinesError;

      if (weeklyRoutines && weeklyRoutines.length > 0) {
        // Verificar completado
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        
        const { data: workoutLogs, error: workoutError } = await supabase
          .from('workout_logs')
          .select('routine_id')
          .eq('user_id', user.id)
          .gte('workout_date', `${selectedDateString}T00:00:00.000Z`)
          .lte('workout_date', `${selectedDateString}T23:59:59.999Z`);

        if (workoutError) throw workoutError;

        const completedRoutineIds = new Set(workoutLogs?.map(log => log.routine_id) || []);
        const programmedRoutineIds = weeklyRoutines.map(r => r.routine_id);
        
        const hasCompletedProgrammedRoutine = programmedRoutineIds.some(id => 
          completedRoutineIds.has(id)
        );

        setActiveProgram({
          type: 'weekly',
          program: program,
          routines: weeklyRoutines
        });
        setIsCompletedForSelectedDate(hasCompletedProgrammedRoutine);
      } else {
        setActiveProgram(null);
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
    loading,
    isCompletedForSelectedDate,
    isCurrentDay: isCurrentDay(),
    refetch: fetchActiveProgramForSelectedDate
  };
};