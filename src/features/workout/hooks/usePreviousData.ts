
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
        
        // Get the most recent workout log for each exercise (including ALL sets)
        // Order by workout_date to get truly most recent, not by workout_log_id
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
          .order('set_number', { ascending: true });
          
        if (error) throw error;
        
        if (workoutLogDetails && workoutLogDetails.length > 0) {
          const exerciseHistory: Record<number, PreviousData[]> = {};
          const notesMap: Record<number, string> = {};
          
          // Group by exercise and get the most recent workout for each (by date, not ID)
          const latestWorkoutByExercise: Record<number, { workout_log_id: number; workout_date: string }> = {};
          
          // Find the most recent workout by date for each exercise
          workoutLogDetails.forEach(detail => {
            const workoutDate = detail.workout_log?.workout_date;
            if (!workoutDate) return;
            
            const currentLatest = latestWorkoutByExercise[detail.exercise_id];
            if (!currentLatest || new Date(workoutDate) > new Date(currentLatest.workout_date)) {
              latestWorkoutByExercise[detail.exercise_id] = {
                workout_log_id: detail.workout_log_id,
                workout_date: workoutDate
              };
            }
          });
          
          // Collect ALL sets from the most recent workout for each exercise
          workoutLogDetails.forEach(detail => {
            // Only include sets from the most recent workout (by date) for this exercise
            if (detail.workout_log_id === latestWorkoutByExercise[detail.exercise_id]?.workout_log_id) {
              if (!exerciseHistory[detail.exercise_id]) {
                exerciseHistory[detail.exercise_id] = [];
              }
              
              // Asegurar que tenemos suficiente espacio en el array para este set_number
              // Llenar con datos vacíos si es necesario hasta llegar al set_number actual
              while (exerciseHistory[detail.exercise_id].length < detail.set_number) {
                exerciseHistory[detail.exercise_id].push({
                  weight: null,
                  reps: null
                });
              }
              
              // Establecer los datos para esta serie específica (1-indexed to 0-indexed)
              const setIndex = detail.set_number - 1;
              exerciseHistory[detail.exercise_id][setIndex] = {
                weight: detail.weight_kg_used,
                reps: detail.reps_completed
              };

              // Store notes if available
              if (detail.notes && !notesMap[detail.exercise_id]) {
                notesMap[detail.exercise_id] = detail.notes;
              }
            }
          });
          
          // Verificar que tenemos todas las series, incluyendo las adicionales
          Object.keys(exerciseHistory).forEach(exerciseIdStr => {
            const exerciseId = parseInt(exerciseIdStr);
            const sets = exerciseHistory[exerciseId];
            
            console.log(`Exercise ${exerciseId} - Previous sets loaded:`, sets.length);
            console.log(`Exercise ${exerciseId} - Set details:`, sets);
          });
          
          console.log("Previous data loaded with ALL sets (including additional):", Object.keys(exerciseHistory).length, "exercises");
          console.log("Complete previous data structure:", exerciseHistory);
          
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
