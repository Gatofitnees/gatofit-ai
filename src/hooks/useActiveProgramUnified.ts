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
      // La base de datos usa 0=domingo, 1=lunes, 2=martes, etc.
      const jsDay = selectedDate.getDay(); // 0=domingo, 1=lunes, etc.
      
      return { 
        weekNumber: currentWeek, 
        dayOfWeek: jsDay // Usar el día JS directamente ya que coincide con la BD
      };
    }
    
    // Para otras fechas, calcular basándose en la fecha de inicio
    const weekNumber = Math.floor(daysDiff / 7) + 1;
    const jsDay = selectedDate.getDay(); // 0=domingo, 1=lunes, etc.
    
    return { weekNumber, dayOfWeek: jsDay };
  };

  const fetchActiveProgramForSelectedDate = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching active program for date:', selectedDate.toDateString());
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
            
            // Query directo para obtener rutinas del programa Gatofit usando SQL raw
            console.log('Fetching routines with params:', { 
              programId: progress.program_id, 
              week: programDay.weekNumber, 
              day: programDay.dayOfWeek 
            });
            
            // 1) Obtener las rutinas base del programa para ese día
            const { data: programRoutines, error: gatofitRoutinesError } = await supabase
              .from('gatofit_program_routines' as any)
              .select('*')
              .eq('program_id', progress.program_id)
              .eq('week_number', programDay.weekNumber)
              .eq('day_of_week', programDay.dayOfWeek)
              .order('order_in_day');

            if (gatofitRoutinesError) {
              console.error('Error fetching Gatofit routines:', gatofitRoutinesError);
            }

            console.log('Gatofit routines for day (raw):', programRoutines);

            if (programRoutines && programRoutines.length > 0) {
              // 2) Cargar detalles de las rutinas desde la tabla routines
              const routineIds = Array.from(new Set(programRoutines.map((r: any) => r.routine_id)));

              const { data: routineDetails, error: routinesDetailsError } = await supabase
                .from('routines')
                .select('id, name, type, estimated_duration_minutes, description')
                .in('id', routineIds);

              console.log('Routine details fetched:', routineDetails);

              if (routinesDetailsError) {
                console.error('Error fetching routine details:', routinesDetailsError);
              }

              const routineMap = new Map<number, any>(
                (routineDetails || []).map((rd: any) => [rd.id, rd])
              );

              const combinedRoutines = programRoutines.map((r: any) => ({
                ...r,
                routine: routineMap.get(r.routine_id) || null,
              }));

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
              const hasCompletedProgrammedRoutine = programmedRoutineIds.some(id => completedRoutineIds.has(id));

              console.log('Setting active Gatofit program with routines (enriched):', combinedRoutines);

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