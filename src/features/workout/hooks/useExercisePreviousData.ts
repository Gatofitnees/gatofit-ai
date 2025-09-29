import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PreviousData } from "../types/workout";

export function useExercisePreviousData(exerciseIds: number[]) {
  const [exercisePreviousData, setExercisePreviousData] = useState<Record<number, PreviousData[]>>({});
  const [exercisePreviousLoaded, setExercisePreviousLoaded] = useState(false);

  useEffect(() => {
    console.log("useExercisePreviousData: Effect called with exerciseIds:", exerciseIds);
    
    if (!exerciseIds || exerciseIds.length === 0) {
      console.log("useExercisePreviousData: No exercise IDs provided, marking as loaded");
      setExercisePreviousLoaded(true);
      return;
    }

    setExercisePreviousLoaded(false);
    setExercisePreviousData({});

    const fetchExercisePreviousData = async () => {
      try {
        console.log("useExercisePreviousData: Fetching general exercise previous data for exercises:", exerciseIds);

        // Get the most recent workout data for each exercise (regardless of routine)
        const { data: exerciseDetails, error: detailsError } = await supabase
          .from('workout_log_exercise_details')
          .select(`
            exercise_id, 
            set_number, 
            weight_kg_used, 
            reps_completed,
            workout_log_id
          `)
          .in('exercise_id', exerciseIds)
          .order('workout_log_id', { ascending: false })
          .limit(200); // Get more data to ensure we have recent data for each exercise

        if (detailsError) {
          console.error("useExercisePreviousData: Error fetching exercise details:", detailsError);
          setExercisePreviousLoaded(true);
          return;
        }

        console.log("useExercisePreviousData: Raw exercise details found:", exerciseDetails?.length || 0);
        console.log("useExercisePreviousData: Raw exercise details:", exerciseDetails);

        if (exerciseDetails && exerciseDetails.length > 0) {
          const groupedData: Record<number, PreviousData[]> = {};
          const latestWorkoutPerExercise: Record<number, number> = {};

          // Find the most recent workout_log_id for each exercise
          exerciseDetails.forEach(detail => {
            if (!latestWorkoutPerExercise[detail.exercise_id] || 
                detail.workout_log_id > latestWorkoutPerExercise[detail.exercise_id]) {
              latestWorkoutPerExercise[detail.exercise_id] = detail.workout_log_id;
            }
          });

          console.log("useExercisePreviousData: Latest workout per exercise:", latestWorkoutPerExercise);

          // Group data only from the most recent workout_log_id for each exercise
          exerciseDetails.forEach(detail => {
            if (detail.workout_log_id !== latestWorkoutPerExercise[detail.exercise_id]) {
              return; // Skip if not from the most recent workout for this exercise
            }

            if (!groupedData[detail.exercise_id]) {
              groupedData[detail.exercise_id] = [];
            }
            
            // Ensure the array is large enough to hold this set_number
            while (groupedData[detail.exercise_id].length < detail.set_number) {
              groupedData[detail.exercise_id].push({ weight: null, reps: null });
            }
            
            // Store the data at the correct index (set_number - 1)
            groupedData[detail.exercise_id][detail.set_number - 1] = {
              weight: detail.weight_kg_used,
              reps: detail.reps_completed
            };
          });

          console.log("useExercisePreviousData: Exercise previous data loaded:", Object.keys(groupedData).length, "exercises");
          console.log("useExercisePreviousData: Previous data details:", groupedData);
          setExercisePreviousData(groupedData);
        } else {
          console.log("useExercisePreviousData: No exercise details found in previous workouts");
        }
      } catch (error) {
        console.error("useExercisePreviousData: Error loading exercise previous data:", error);
      } finally {
        setExercisePreviousLoaded(true);
      }
    };

    fetchExercisePreviousData();
  }, [JSON.stringify(exerciseIds)]); // Use JSON.stringify for more reliable dependency tracking

  return {
    exercisePreviousData,
    exercisePreviousLoaded
  };
}