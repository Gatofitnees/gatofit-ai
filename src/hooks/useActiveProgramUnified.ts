import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeeklyProgram } from "./useWeeklyPrograms";
import { GatofitProgram, UserGatofitProgress } from "./useGatofitPrograms";

export interface AdminProgram {
  id: string;
  name: string;
  description?: string;
  difficulty_level: string;
  duration_weeks: number;
  estimated_sessions_per_week?: number;
  program_type: string;
  target_audience?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnifiedProgramData {
  type: 'weekly' | 'gatofit' | 'admin';
  program: WeeklyProgram | GatofitProgram | AdminProgram;
  routines: any[];
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
    
    console.log('🔢 Day calculation:', {
      startDate,
      selectedDate: selectedDate.toDateString(),
      daysDiff,
      currentWeek,
      currentDay
    });
    
    if (daysDiff < 0) {
      console.log('❌ Selected date is before program start');
      return null; // Fecha anterior al inicio
    }
    
    // Para la fecha actual, usar el progreso guardado
    const today = new Date();
    const isToday = selected.toDateString() === today.toDateString();
    
    if (isToday) {
      // Usar el progreso actual para el día de hoy
      // Convertir JS day (0=domingo) a Monday-first (0=lunes)
      const jsDay = selectedDate.getDay(); // 0=domingo, 1=lunes, etc.
      const mondayFirstDay = jsDay === 0 ? 6 : jsDay - 1; // 0=lunes, 1=martes, ..., 6=domingo
      
      console.log('📅 Today calculation:', {
        jsDay,
        mondayFirstDay,
        currentWeek,
        currentDay
      });
      
      return { 
        weekNumber: currentWeek, 
        dayOfWeek: mondayFirstDay
      };
    }
    
    // Para otras fechas, calcular basándose en la fecha de inicio
    const weekNumber = Math.floor(daysDiff / 7) + 1;
    const jsDay = selectedDate.getDay(); // 0=domingo, 1=lunes, etc.
    const mondayFirstDay = jsDay === 0 ? 6 : jsDay - 1; // 0=lunes, 1=martes, ..., 6=domingo
    
    console.log('📅 Other date calculation:', {
      weekNumber,
      jsDay,
      mondayFirstDay,
      daysDiff
    });
    
    return { weekNumber, dayOfWeek: mondayFirstDay };
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

      // 1. Verificar programa Admin activo (prioridad más alta)
      const { data: adminPrograms, error: adminError } = await supabase
        .from('user_assigned_programs')
        .select(`
          *,
          program:program_id (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (adminError) throw adminError;

      if (adminPrograms && adminPrograms.length > 0) {
        const adminAssignment = adminPrograms[0];
        console.log('Active Admin program found:', adminAssignment);
        
        // For admin programs - calculate which routines to show
        const dayOfWeek = selectedDate.getDay();
        const dayOfWeekAdjusted = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert JS day (0=Sunday) to our format (0=Monday)
        // Calcular día actual del programa admin
        const startDate = new Date(adminAssignment.started_at);
        const daysDiff = Math.floor((selectedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0) {
          const weekNumber = Math.floor(daysDiff / 7) + 1;
          
          console.log('Admin program day calculation:', { weekNumber, dayOfWeek: dayOfWeekAdjusted, daysDiff });

          // Obtener rutinas del programa admin para este día
          const { data: adminRoutines, error: adminRoutinesError } = await supabase
            .from('admin_program_routines')
            .select('*')
            .eq('program_id', adminAssignment.program_id)
            .eq('week_number', weekNumber)
            .eq('day_of_week', dayOfWeekAdjusted)
            .order('order_in_day');

          if (adminRoutinesError) {
            console.error('Error fetching admin routines:', adminRoutinesError);
          }

          console.log('🔍 Admin routines found:', adminRoutines);

            // Separate fetch for routine details to handle missing routines
            if (adminRoutines && adminRoutines.length > 0) {
              const routineIds = adminRoutines.map((r: any) => r.routine_id);
              
              console.log('🔍 Fetching routine details for IDs:', routineIds);
              
              const { data: routineDetails, error: routineDetailsError } = await supabase
                .from('routines')
                .select('id, name, type, estimated_duration_minutes, description')
                .in('id', routineIds);

              console.log('📋 Routine details response:', { routineDetails, error: routineDetailsError });

              if (routineDetailsError) {
                console.error('Error fetching routine details:', routineDetailsError);
              }

              // Create map for easy lookup
              const routineMap = new Map(routineDetails?.map((r: any) => [r.id, r]) || []);
              
              console.log('🗺️ Routine map created:', routineMap);
              
              // Log missing routines for debugging
              const missingRoutines = routineIds.filter(id => !routineMap.has(id));
              if (missingRoutines.length > 0) {
                console.warn('⚠️ Missing routine details for admin program IDs:', missingRoutines);
              }

            // Combine data with fallback for missing routines
            const routines = adminRoutines.map((item: any) => {
              const routineDetail = routineMap.get(item.routine_id);
              return {
                ...item,
                routine: routineDetail || {
                  id: item.routine_id,
                  name: `Rutina no encontrada (ID: ${item.routine_id})`,
                  type: 'strength',
                  estimated_duration_minutes: 60,
                  description: 'Esta rutina no está disponible en el sistema',
                  is_missing: true
                }
              };
            });

            console.log('Admin routines for day:', routines);
            
            // Only check completion for existing routines
            const existingRoutines = routines.filter(r => !r.routine?.is_missing);
            if (existingRoutines.length > 0) {
              const selectedDateString = selectedDate.toISOString().split('T')[0];
              const { data: workoutLogs, error: workoutError } = await supabase
                .from('workout_logs')
                .select('routine_id')
                .eq('user_id', user.id)
                .gte('workout_date', `${selectedDateString}T00:00:00.000Z`)
                .lte('workout_date', `${selectedDateString}T23:59:59.999Z`);

              if (workoutError) throw workoutError;

              const completedRoutineIds = new Set(workoutLogs?.map(log => log.routine_id) || []);
              const programmedRoutineIds = existingRoutines.map((r: any) => r.routine_id);
              const hasCompletedProgrammedRoutine = programmedRoutineIds.some(id => completedRoutineIds.has(id));

              setIsCompletedForSelectedDate(hasCompletedProgrammedRoutine);
            } else {
              setIsCompletedForSelectedDate(false);
            }

            setActiveProgram({
              type: 'admin',
              program: adminAssignment.program,
              routines: routines
            });
            return;
          } else {
            console.log('No admin routines found for day:', { weekNumber, dayOfWeekAdjusted });
          }
        }
      }

      // 2. Verificar programa Gatofit activo (prioridad alta)
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
            
            // 1) Obtener las rutinas base del programa para ese día
            const { data: programRoutines, error: gatofitRoutinesError } = await supabase
              .from('gatofit_program_routines')
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

      // 3. Si no hay programa Gatofit ni Admin, buscar programa semanal
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

      // Obtener día de la semana para fecha seleccionada (convertir a Monday-first: 0 = lunes)
      const jsDay = selectedDate.getDay(); // 0=domingo, 1=lunes, etc.
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // 0=lunes, 1=martes, ..., 6=domingo
      
      console.log('📅 Weekly program day calculation:', {
        selectedDate: selectedDate.toDateString(),
        jsDay,
        dayOfWeek: dayOfWeek
      });

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