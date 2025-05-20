
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface WorkoutRoutine {
  id: number;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
}

export const useRoutines = () => {
  const { toast } = useToast();
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // User not logged in, show demo routines
          setRoutines([
            {
              id: 1,
              name: "Full Body Force",
              type: "Fuerza",
              estimated_duration_minutes: 45,
              exercise_count: 8,
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              name: "HIIT Quemagrasa",
              type: "Cardio",
              estimated_duration_minutes: 30,
              exercise_count: 12,
              created_at: new Date().toISOString()
            },
            {
              id: 3,
              name: "Día de Pierna",
              type: "Fuerza",
              estimated_duration_minutes: 50,
              exercise_count: 7,
              created_at: new Date().toISOString()
            }
          ]);
          setLoading(false);
          return;
        }

        // Get user's routines with exercise count
        const { data, error } = await supabase
          .from('routines')
          .select(`
            *,
            routine_exercises:routine_exercises(count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }

        if (data) {
          // Transform data to include exercise count
          const formattedData = data.map(routine => ({
            ...routine,
            exercise_count: routine.routine_exercises?.[0]?.count || 0
          }));
          setRoutines(formattedData);
        }
      } catch (error) {
        console.error("Error fetching routines:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las rutinas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [toast]);

  return { routines, loading };
};
