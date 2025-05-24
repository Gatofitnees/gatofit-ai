
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
  const previousDataLoaded = useRef(false);

  const {
    temporaryExercises,
    addTemporaryExercises,
    clearTemporaryExercises,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet
  } = useTemporaryExercises(routineId);

  // Load exercise history for each exercise - only once
  useEffect(() => {
    if (!exerciseDetails.length || previousDataLoaded.current) return;
    
    const fetchPreviousData = async () => {
      try {
        const exerciseIds = exerciseDetails.map(ex => ex.id);
        
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
          
          workoutLogDetails.forEach(detail => {
            if (!exerciseHistory[detail.exercise_id]) {
              exerciseHistory[detail.exercise_id] = [];
            }
            
            if (detail.set_number && detail.set_number <= 20) {
              exerciseHistory[detail.exercise_id][detail.set_number - 1] = {
                weight: detail.weight_kg_used,
                reps: detail.reps_completed
              };

              if (detail.notes && !notesMap[detail.exercise_id]) {
                notesMap[detail.exercise_id] = detail.notes;
              }
            }
          });
          
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

  // Initialize base exercises only once when previous data is loaded
  useEffect(() => {
    if (!exerciseDetails.length || !previousDataLoaded.current || isInitialized.current) return;
    
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
  }, [exerciseDetails, previousDataLoaded.current]);

  // Combine base exercises with temporary exercises - FIXED useEffect
  useEffect(() => {
    if (!isInitialized.current) return;
    
    console.log("Combining exercises - baseExerciseData keys:", Object.keys(baseExerciseData));
    console.log("Temporary exercises count:", temporaryExercises.length);
    
    // Use the preserved data from baseExerciseData instead of recreating
    const baseExercisesArray = exerciseDetails.map(ex => {
      const preservedData = baseExerciseData[ex.id];
      if (preservedData) {
        console.log(`Using preserved data for exercise ${ex.id}:`, preservedData.sets.map(s => ({ weight: s.weight, reps: s.reps })));
        return preservedData;
      }
      
      // Fallback if not in baseExerciseData yet (shouldn't happen now)
      console.warn(`Fallback creation for exercise ${ex.id}`);
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
      totalCount: allExercises.length,
      baseExercisesData: baseExercisesArray.map(ex => ({ 
        id: ex.id, 
        name: ex.name, 
        setsWithData: ex.sets.filter(s => s.weight !== null || s.reps !== null).length 
      }))
    });
  }, [baseExerciseData, temporaryExercises]); // REMOVED problematic dependencies

  const handleInputChange = (
    exerciseIndex: number, 
    setIndex: number, 
    field: 'weight' | 'reps', 
    value: string
  ) => {
    const baseExerciseCount = exerciseDetails.length;
    
    console.log(`Input change - Exercise ${exerciseIndex}, Set ${setIndex}, Field: ${field}, Value: ${value}`);
    
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
    
    console.log(`Updating base exercise ${exercise.id} set ${setIndex} ${field} to:`, numValue);
    
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
        console.log(`Updated base exercise ${exercise.id} data:`, updated[exercise.id].sets.map(s => ({ weight: s.weight, reps: s.reps })));
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
    if (!result.destination) return;
    
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
