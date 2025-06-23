
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PreviousData } from "../types/workout";

export function usePreviousData(exerciseDetails: any[]) {
  const [previousData, setPreviousData] = useState<Record<number, PreviousData[]>>({});
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<number, string>>({});
  const previousDataLoaded = useRef(false);

  // Load exercise history for each exercise - only once
  useEffect(() => {
    if (!exerciseDetails.length || previousDataLoaded.current) return;
    
    const fetchPreviousData = async () => {
      try {
        const exerciseIds = exerciseDetails.map(ex => ex.id);
        
        // Get the most recent workout log for each exercise (including additional sets)
        const { data: workoutLogDetails, error } = await supabase
          .from('workout_log_exercise_details')
          .select(`
            exercise_id,
            set_number,
            weight_kg_used,
            reps_completed,
            notes,
            workout_log_id,
            workout_log:workout_logs(workout_date)
          `)
          .in('exercise_id', exerciseIds)
          .order('workout_log_id', { ascending: false });
          
        if (error) throw error;
        
        if (workoutLogDetails && workoutLogDetails.length > 0) {
          const exerciseHistory: Record<number, PreviousData[]> = {};
          const notesMap: Record<number, string> = {};
          
          // Group by exercise and get the most recent workout for each
          const latestWorkoutByExercise: Record<number, number> = {};
          
          // Find the most recent workout_log_id for each exercise
          workoutLogDetails.forEach(detail => {
            if (!latestWorkoutByExercise[detail.exercise_id] || 
                detail.workout_log_id > latestWorkoutByExercise[detail.exercise_id]) {
              latestWorkoutByExercise[detail.exercise_id] = detail.workout_log_id;
            }
          });
          
          // Now collect ALL sets from the most recent workout for each exercise
          workoutLogDetails.forEach(detail => {
            // Only include sets from the most recent workout for this exercise
            if (detail.workout_log_id === latestWorkoutByExercise[detail.exercise_id]) {
              if (!exerciseHistory[detail.exercise_id]) {
                exerciseHistory[detail.exercise_id] = [];
              }
              
              // Ensure we have enough slots in the array for this set number
              while (exerciseHistory[detail.exercise_id].length < detail.set_number) {
                exerciseHistory[detail.exercise_id].push({
                  weight: null,
                  reps: null
                });
              }
              
              // Set the data for this specific set (1-indexed to 0-indexed)
              exerciseHistory[detail.exercise_id][detail.set_number - 1] = {
                weight: detail.weight_kg_used,
                reps: detail.reps_completed
              };

              // Store notes if available
              if (detail.notes && !notesMap[detail.exercise_id]) {
                notesMap[detail.exercise_id] = detail.notes;
              }
            }
          });
          
          console.log("Previous data loaded with ALL sets (including additional):", Object.keys(exerciseHistory).length, "exercises");
          console.log("Previous data details:", exerciseHistory);
          
          setPreviousData(exerciseHistory);
          setExerciseNotesMap(notesMap);
        }
        
        previousDataLoaded.current = true;
      } catch (error) {
        console.error("Error fetching previous workout data:", error);
        previousDataLoaded.current = true;
      }
    };
    
    fetchPreviousData();
  }, [exerciseDetails]);

  return {
    previousData,
    exerciseNotesMap,
    previousDataLoaded: previousDataLoaded.current
  };
}
