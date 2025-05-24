
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PreviousData } from "../types/workout";

export function useRoutinePreviousData(routineId: number | undefined) {
  const [routinePreviousData, setRoutinePreviousData] = useState<Record<number, PreviousData[]>>({});
  const [routinePreviousLoaded, setRoutinePreviousLoaded] = useState(false);

  useEffect(() => {
    if (!routineId) {
      setRoutinePreviousLoaded(true);
      return;
    }

    const fetchRoutinePreviousData = async () => {
      try {
        console.log("Fetching routine-specific previous data for routine:", routineId);

        // Get the most recent workout log for this specific routine
        const { data: latestWorkout, error: workoutError } = await supabase
          .from('workout_logs')
          .select('id')
          .eq('routine_id', routineId)
          .order('workout_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (workoutError) {
          console.error("Error fetching latest workout:", workoutError);
          setRoutinePreviousLoaded(true);
          return;
        }

        if (!latestWorkout) {
          console.log("No previous workout found for this routine");
          setRoutinePreviousLoaded(true);
          return;
        }

        // Get exercise details from the latest workout of this routine
        const { data: exerciseDetails, error: detailsError } = await supabase
          .from('workout_log_exercise_details')
          .select('exercise_id, set_number, weight_kg_used, reps_completed')
          .eq('workout_log_id', latestWorkout.id)
          .order('exercise_id', { ascending: true })
          .order('set_number', { ascending: true });

        if (detailsError) {
          console.error("Error fetching exercise details:", detailsError);
          setRoutinePreviousLoaded(true);
          return;
        }

        if (exerciseDetails && exerciseDetails.length > 0) {
          const groupedData: Record<number, PreviousData[]> = {};
          
          exerciseDetails.forEach(detail => {
            if (!groupedData[detail.exercise_id]) {
              groupedData[detail.exercise_id] = [];
            }
            
            groupedData[detail.exercise_id].push({
              weight: detail.weight_kg_used,
              reps: detail.reps_completed
            });
          });

          console.log("Routine previous data loaded:", Object.keys(groupedData).length, "exercises");
          setRoutinePreviousData(groupedData);
        } else {
          console.log("No exercise details found in previous workout");
        }
      } catch (error) {
        console.error("Error loading routine previous data:", error);
      } finally {
        setRoutinePreviousLoaded(true);
      }
    };

    fetchRoutinePreviousData();
  }, [routineId]);

  return {
    routinePreviousData,
    routinePreviousLoaded
  };
}
