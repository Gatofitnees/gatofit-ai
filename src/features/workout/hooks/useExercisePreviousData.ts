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
        console.log("Fetching general exercise previous data for exercises:", exerciseIds);

        // Get the most recent workout data for each exercise (regardless of routine)
        const { data: exerciseDetails, error: detailsError } = await supabase
          .from('workout_log_exercise_details')
          .select(`
            exercise_id, 
            set_number, 
            weight_kg_used, 
            reps_completed,
            workout_log:workout_logs!workout_log_exercise_details_workout_log_id_fkey(workout_date)
          `)
          .in('exercise_id', exerciseIds)
          .order('workout_log.workout_date', { ascending: false })
          .limit(50); // Get more data to ensure we have recent data for each exercise

        if (detailsError) {
          console.error("Error fetching exercise details:", detailsError);
          setExercisePreviousLoaded(true);
          return;
        }

        if (exerciseDetails && exerciseDetails.length > 0) {
          const groupedData: Record<number, PreviousData[]> = {};
          const latestWorkoutPerExercise: Record<number, string> = {};

          // Find the most recent workout date for each exercise
          exerciseDetails.forEach(detail => {
            const workoutDate = detail.workout_log?.workout_date;
            if (!workoutDate) return;

            if (!latestWorkoutPerExercise[detail.exercise_id] || 
                workoutDate > latestWorkoutPerExercise[detail.exercise_id]) {
              latestWorkoutPerExercise[detail.exercise_id] = workoutDate;
            }
          });

          // Group data only from the most recent workout for each exercise
          exerciseDetails.forEach(detail => {
            const workoutDate = detail.workout_log?.workout_date;
            if (!workoutDate || workoutDate !== latestWorkoutPerExercise[detail.exercise_id]) {
              return; // Skip if not from the most recent workout for this exercise
            }

            if (!groupedData[detail.exercise_id]) {
              groupedData[detail.exercise_id] = [];
            }
            
            groupedData[detail.exercise_id].push({
              weight: detail.weight_kg_used,
              reps: detail.reps_completed
            });
          });

          console.log("Exercise previous data loaded:", Object.keys(groupedData).length, "exercises");
          console.log("Previous data details:", groupedData);
          setExercisePreviousData(groupedData);
        } else {
          console.log("No exercise details found in previous workouts");
        }
      } catch (error) {
        console.error("Error loading exercise previous data:", error);
      } finally {
        setExercisePreviousLoaded(true);
      }
    };

    fetchExercisePreviousData();
  }, [exerciseIds.join(',')]); // Use join to create a stable dependency

  return {
    exercisePreviousData,
    exercisePreviousLoaded
  };
}