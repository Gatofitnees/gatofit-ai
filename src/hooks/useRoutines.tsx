
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkoutRoutine {
  id: number;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
  is_predefined?: boolean;
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
      
      if (!user) {
        console.log("No authenticated user found");
        setRoutines([]);
        setLoading(false);
        return;
      }
      
      // Get all user routines plus predefined ones
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          routine_exercises(count)
        `)
        .or(`user_id.eq.${user.id},is_predefined.eq.true`)
        .order('created_at', { ascending: false });
          
      if (error) {
        console.error("Error fetching routines:", error);
        throw error;
      }

      if (data) {
        // Transform data to include exercise count
        const formattedData = data.map(routine => ({
          ...routine,
          exercise_count: routine.routine_exercises?.[0]?.count || 0
        }));
        
        console.log("Routines fetched successfully:", formattedData.length);
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

  // Fetch routines on component mount
  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  return { 
    routines, 
    loading,
    refetch: fetchRoutines
  };
};
