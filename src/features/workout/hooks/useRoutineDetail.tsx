
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRoutineDetail(routineId: number | undefined) {
  const [routine, setRoutine] = useState<any>(null);
  const [exerciseDetails, setExerciseDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!routineId) {
      setLoading(false);
      return;
    }

    const fetchRoutineDetail = async () => {
      try {
        setLoading(true);
        
        // Get routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', routineId)
          .single();

        if (routineError) {
          console.error("Error fetching routine:", routineError);
          throw routineError;
        }

        // Get exercises with proper ordering
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select(`
            *,
            exercises (
              id,
              name,
              muscle_group_main,
              equipment_required,
              description
            )
          `)
          .eq('routine_id', routineId)
          .order('exercise_order', { ascending: true }); // Ensure proper ordering

        if (exercisesError) {
          console.error("Error fetching exercises:", exercisesError);
          throw exercisesError;
        }

        setRoutine(routineData);
        setExerciseDetails(exercisesData || []);
        
      } catch (error) {
        console.error("Error in fetchRoutineDetail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutineDetail();
  }, [routineId]);

  return { routine, exerciseDetails, loading };
}
