
import { useState, useEffect } from "react";
import { useToastHelper } from "@/hooks/useToastHelper";
import { supabase } from "@/integrations/supabase/client";

interface WorkoutRoutine {
  id: string;
  name: string;
  type: string;
  duration: string;
  exercises: number;
}

export const useRoutines = () => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastHelper();

  const fetchRoutines = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      // First get the basic routine info
      const { data: routinesData, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', session.session.user.id);
        
      if (error) throw error;
      
      if (routinesData) {
        // Now fetch exercise counts for each routine
        const routinesWithExercises = await Promise.all(
          routinesData.map(async (routine) => {
            const { count: exerciseCount, error: countError } = await supabase
              .from('routine_exercises')
              .select('*', { count: 'exact', head: true })
              .eq('routine_id', routine.id);
            
            if (countError) {
              console.error("Error counting exercises:", countError);
            }
            
            // Use the routine.type if it exists, otherwise use a default value
            const routineType = (routine as any).type || "Mixto";
            
            return {
              id: routine.id.toString(),
              name: routine.name,
              type: routineType, // Using the safely accessed type value
              duration: `${routine.estimated_duration_minutes || 45} min`,
              exercises: exerciseCount || 0
            };
          })
        );
        
        setRoutines(routinesWithExercises);
      }
    } catch (error) {
      console.error("Error fetching routines:", error);
      toast.showError(
        "Error", 
        "No se pudieron cargar las rutinas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    routines,
    isLoading,
    fetchRoutines
  };
};
