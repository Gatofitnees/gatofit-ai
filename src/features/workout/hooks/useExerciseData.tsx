
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkoutExercise, WorkoutSet, PreviousData } from "../types/workout";
import { useTemporaryExercises } from "./useTemporaryExercises";

export function useExerciseData(exerciseDetails: any[], routineId?: number) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [previousData, setPreviousData] = useState<Record<number, PreviousData[]>>({});
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<number, string>>({});
  const [showExerciseDetails, setShowExerciseDetails] = useState<number | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState<number | null>(null);
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);

  const {
    temporaryExercises,
    addTemporaryExercises,
    clearTemporaryExercises,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet
  } = useTemporaryExercises(routineId);

  // Load exercise history for each exercise
  useEffect(() => {
    if (!exerciseDetails.length) return;
    
    const fetchPreviousData = async () => {
      try {
        const exerciseIds = exerciseDetails.map(ex => ex.id);
        
        // Fetch the latest workout log for these exercises
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
          // Group by exercise_id
          const exerciseHistory: Record<number, PreviousData[]> = {};
          const notesMap: Record<number, string> = {};
          
          workoutLogDetails.forEach(detail => {
            if (!exerciseHistory[detail.exercise_id]) {
              exerciseHistory[detail.exercise_id] = [];
            }
            
            // Add the set data if it matches the current position
            if (detail.set_number && detail.set_number <= 20) { // Limit to 20 sets
              exerciseHistory[detail.exercise_id][detail.set_number - 1] = {
                weight: detail.weight_kg_used,
                reps: detail.reps_completed
              };

              // Store notes for the exercise
              if (detail.notes && !notesMap[detail.exercise_id]) {
                notesMap[detail.exercise_id] = detail.notes;
              }
            }
          });
          
          setPreviousData(exerciseHistory);
          setExerciseNotesMap(notesMap);
        }
      } catch (error) {
        console.error("Error fetching previous workout data:", error);
      }
    };
    
    fetchPreviousData();
  }, [exerciseDetails]);

  // Initialize workout exercises from routine details and combine with temporary exercises
  useEffect(() => {
    // Format base routine exercises
    const baseExercises: WorkoutExercise[] = exerciseDetails.map(ex => {
      const formattedSets: WorkoutSet[] = Array.from(
        { length: ex.sets || 0 },
        (_, i) => ({
          set_number: i + 1,
          weight: null,
          reps: null,
          notes: "",
          previous_weight: previousData[ex.id]?.[i]?.weight || null,
          previous_reps: previousData[ex.id]?.[i]?.reps || null
        })
      );

      return {
        id: ex.id,
        name: ex.name,
        sets: formattedSets,
        muscle_group_main: ex.muscle_group_main,
        equipment_required: ex.equipment_required,
        notes: exerciseNotesMap[ex.id] || ""
      };
    });

    // Combine base exercises with temporary exercises
    const allExercises = [...baseExercises, ...temporaryExercises];
    setExercises(allExercises);
  }, [exerciseDetails, previousData, exerciseNotesMap, temporaryExercises]);

  const handleInputChange = (
    exerciseIndex: number, 
    setIndex: number, 
    field: 'weight' | 'reps', 
    value: string
  ) => {
    const baseExerciseCount = exerciseDetails.length;
    
    // Check if this is a temporary exercise
    if (exerciseIndex >= baseExerciseCount) {
      const tempIndex = exerciseIndex - baseExerciseCount;
      updateTemporaryExercise(tempIndex, setIndex, field, value);
      return;
    }
    
    // Handle base exercises
    const updatedExercises = [...exercises];
    const numValue = value === '' ? null : Number(value);
    updatedExercises[exerciseIndex].sets[setIndex][field] = numValue;
    setExercises(updatedExercises);
  };

  const handleExerciseNotesChange = (exerciseIndex: number, notes: string) => {
    const baseExerciseCount = exerciseDetails.length;
    
    // Check if this is a temporary exercise
    if (exerciseIndex >= baseExerciseCount) {
      const tempIndex = exerciseIndex - baseExerciseCount;
      updateTemporaryExerciseNotes(tempIndex, notes);
      return;
    }
    
    // Handle base exercises
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].notes = notes;
    setExercises(updatedExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const baseExerciseCount = exerciseDetails.length;
    
    // Check if this is a temporary exercise
    if (exerciseIndex >= baseExerciseCount) {
      const tempIndex = exerciseIndex - baseExerciseCount;
      addTemporaryExerciseSet(tempIndex);
      return;
    }
    
    // Handle base exercises
    const updatedExercises = [...exercises];
    const exercise = updatedExercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    
    exercise.sets.push({
      set_number: exercise.sets.length + 1,
      weight: lastSet?.weight || null,
      reps: lastSet?.reps || null,
      notes: "",
      previous_weight: null,
      previous_reps: null
    });
    
    setExercises(updatedExercises);
  };

  const handleReorderDrag = (result: any) => {
    if (!result.destination) return; // Dropped outside the list
    
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setExercises(items);
  };

  const handleToggleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
  };

  return {
    exercises,
    showStatsDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleReorderDrag,
    setShowStatsDialog,
    handleToggleReorderMode,
    addTemporaryExercises,
    clearTemporaryExercises
  };
}
