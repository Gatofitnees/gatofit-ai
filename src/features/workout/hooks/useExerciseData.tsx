
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkoutExercise, WorkoutSet, PreviousData } from "../types/workout";
import { useTemporaryExercises } from "./useTemporaryExercises";

export function useExerciseData(exerciseDetails: any[], routineId?: number) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [baseExerciseData, setBaseExerciseData] = useState<Record<number, WorkoutExercise>>({});
  const [previousData, setPreviousData] = useState<Record<number, PreviousData[]>>({});
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<number, string>>({});
  const [showExerciseDetails, setShowExerciseDetails] = useState<number | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState<number | null>(null);
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const isInitialized = useRef(false);

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

  // Initialize base exercises only once
  useEffect(() => {
    if (!exerciseDetails.length || isInitialized.current) return;
    
    console.log("Initializing base exercises for the first time");
    
    const initialBaseExercises: Record<number, WorkoutExercise> = {};
    
    exerciseDetails.forEach(ex => {
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

      initialBaseExercises[ex.id] = {
        id: ex.id,
        name: ex.name,
        sets: formattedSets,
        muscle_group_main: ex.muscle_group_main,
        equipment_required: ex.equipment_required,
        notes: exerciseNotesMap[ex.id] || ""
      };
    });
    
    setBaseExerciseData(initialBaseExercises);
    isInitialized.current = true;
  }, [exerciseDetails, previousData, exerciseNotesMap]);

  // Combine base exercises with temporary exercises
  useEffect(() => {
    if (!isInitialized.current) return;
    
    // Convert base exercise data to array format
    const baseExercisesArray = exerciseDetails.map(ex => {
      const existingData = baseExerciseData[ex.id];
      if (existingData) {
        return existingData;
      }
      
      // Fallback if not in baseExerciseData yet
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
    const allExercises = [...baseExercisesArray, ...temporaryExercises];
    setExercises(allExercises);
    
    console.log("Combined exercises:", {
      baseCount: baseExercisesArray.length,
      tempCount: temporaryExercises.length,
      totalCount: allExercises.length
    });
  }, [baseExerciseData, temporaryExercises, exerciseDetails, previousData, exerciseNotesMap]);

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
    
    // Handle base exercises - update the baseExerciseData
    const exercise = exercises[exerciseIndex];
    if (!exercise) return;
    
    const numValue = value === '' ? null : Number(value);
    
    setBaseExerciseData(prev => {
      const updated = { ...prev };
      if (updated[exercise.id]) {
        updated[exercise.id] = {
          ...updated[exercise.id],
          sets: updated[exercise.id].sets.map((set, idx) => 
            idx === setIndex 
              ? { ...set, [field]: numValue }
              : set
          )
        };
      }
      return updated;
    });
  };

  const handleExerciseNotesChange = (exerciseIndex: number, notes: string) => {
    const baseExerciseCount = exerciseDetails.length;
    
    // Check if this is a temporary exercise
    if (exerciseIndex >= baseExerciseCount) {
      const tempIndex = exerciseIndex - baseExerciseCount;
      updateTemporaryExerciseNotes(tempIndex, notes);
      return;
    }
    
    // Handle base exercises - update the baseExerciseData
    const exercise = exercises[exerciseIndex];
    if (!exercise) return;
    
    setBaseExerciseData(prev => {
      const updated = { ...prev };
      if (updated[exercise.id]) {
        updated[exercise.id] = {
          ...updated[exercise.id],
          notes: notes
        };
      }
      return updated;
    });
  };

  const handleAddSet = (exerciseIndex: number) => {
    const baseExerciseCount = exerciseDetails.length;
    
    // Check if this is a temporary exercise
    if (exerciseIndex >= baseExerciseCount) {
      const tempIndex = exerciseIndex - baseExerciseCount;
      addTemporaryExerciseSet(tempIndex);
      return;
    }
    
    // Handle base exercises - update the baseExerciseData
    const exercise = exercises[exerciseIndex];
    if (!exercise) return;
    
    setBaseExerciseData(prev => {
      const updated = { ...prev };
      if (updated[exercise.id]) {
        const currentExercise = updated[exercise.id];
        const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
        
        updated[exercise.id] = {
          ...currentExercise,
          sets: [
            ...currentExercise.sets,
            {
              set_number: currentExercise.sets.length + 1,
              weight: lastSet?.weight || null,
              reps: lastSet?.reps || null,
              notes: "",
              previous_weight: null,
              previous_reps: null
            }
          ]
        };
      }
      return updated;
    });
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
