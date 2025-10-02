import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PreviousData } from "../types/workout";

export function useExercisePreviousData(exerciseIds: number[]) {
  const [exercisePreviousData, setExercisePreviousData] = useState<Record<number, PreviousData[]>>({});
  const [exercisePreviousLoaded, setExercisePreviousLoaded] = useState(false);

  useEffect(() => {
    if (!exerciseIds || exerciseIds.length === 0) {
      console.log("No exercise IDs provided, marking as loaded");
      setExercisePreviousLoaded(true);
      return;
    }

    const fetchExercisePreviousData = async () => {
      try {
        console.log("Fetching exercise-specific previous data for exercises:", exerciseIds);

        // Get the most recent workout log details for each exercise
        const { data: exerciseDetails, error: detailsError } = await supabase
          .from('workout_log_exercise_details')
          .select('exercise_id, set_number, weight_kg_used, reps_completed, workout_log_id')
          .in('exercise_id', exerciseIds)
          .order('workout_log_id', { ascending: false });

        if (detailsError) {
          console.error("Error fetching exercise details:", detailsError);
          setExercisePreviousLoaded(true);
          return;
        }

        if (!exerciseDetails || exerciseDetails.length === 0) {
          console.log("No previous exercise data found");
          setExercisePreviousLoaded(true);
          return;
        }

        // Group by exercise_id and get only the most recent workout_log_id for each
        const latestWorkoutByExercise: Record<number, number> = {};
        exerciseDetails.forEach(detail => {
          if (!latestWorkoutByExercise[detail.exercise_id] || 
              detail.workout_log_id > latestWorkoutByExercise[detail.exercise_id]) {
            latestWorkoutByExercise[detail.exercise_id] = detail.workout_log_id;
          }
        });

        // Filter to only include sets from the most recent workout for each exercise
        const groupedData: Record<number, PreviousData[]> = {};
        
        exerciseDetails.forEach(detail => {
          // Only include if this is from the most recent workout for this exercise
          if (detail.workout_log_id === latestWorkoutByExercise[detail.exercise_id]) {
            if (!groupedData[detail.exercise_id]) {
              groupedData[detail.exercise_id] = [];
            }
            
            groupedData[detail.exercise_id].push({
              weight: detail.weight_kg_used,
              reps: detail.reps_completed
            });
          }
        });

        // Sort sets by order within each exercise (assuming they're in order from the query)
        Object.keys(groupedData).forEach(exerciseId => {
          const id = parseInt(exerciseId);
          groupedData[id].sort((a, b) => {
            // Sets should already be in order from set_number, but we ensure consistent ordering
            const aIndex = groupedData[id].indexOf(a);
            const bIndex = groupedData[id].indexOf(b);
            return aIndex - bIndex;
          });
        });

        console.log("Exercise previous data loaded:", Object.keys(groupedData).length, "exercises");
        console.log("Previous data details:", groupedData);
        setExercisePreviousData(groupedData);
      } catch (error) {
        console.error("Error loading exercise previous data:", error);
      } finally {
        setExercisePreviousLoaded(true);
      }
    };

    fetchExercisePreviousData();
  }, [exerciseIds.join(',')]); // Use join to create stable dependency

  return {
    exercisePreviousData,
    exercisePreviousLoaded
  };
}
