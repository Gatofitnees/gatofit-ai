
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { convertRoutineTypeToUi } from "@/features/workout/utils/routineTypeMapping";

interface WorkoutRoutine {
  id: number;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
  is_predefined?: boolean;
  source_type?: 'created' | 'downloaded' | 'gatofit_program';
}

export const useRoutines = () => {
  const { toast } = useToast();
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching routines...");
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('routines')
        .select(`
          *,
          routine_exercises!routine_exercises_routine_id_fkey(count)
        `)
        .eq('is_predefined', false)
        .order('created_at', { ascending: false });
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        setRoutines([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query;
          
      if (error) {
        console.error("Error fetching routines:", error);
        throw error;
      }

      if (data) {
        // Transform data to include exercise count, convert types, and detect source
        const formattedData = data.map(routine => {
          // Detectar si es una rutina descargada o temporal de programa
          const isDownloaded = routine.name.includes('(Copia)');
          const isFromGatofitProgram = routine.name.includes('(Programa Gatofit)');
          
          let sourceType: 'created' | 'downloaded' | 'gatofit_program' = 'created';
          if (isFromGatofitProgram) {
            sourceType = 'gatofit_program';
          } else if (isDownloaded) {
            sourceType = 'downloaded';
          }
          
          return {
            ...routine,
            type: routine.type ? convertRoutineTypeToUi(routine.type) : 'General',
            exercise_count: routine.routine_exercises?.[0]?.count || 0,
            source_type: sourceType
          };
        });
        
        console.log("Routines fetched:", formattedData.length);
        setRoutines(formattedData);
      }
    } catch (error: any) {
      console.error("Error fetching routines:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutinas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  return { 
    routines, 
    loading,
    refetch: fetchRoutines
  };
};
