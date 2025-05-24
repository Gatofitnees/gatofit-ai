
import { useState, useEffect } from "react";
import { WorkoutExercise } from "../types/workout";
import { useTemporaryExercises } from "./useTemporaryExercises";
import { usePreviousData } from "./usePreviousData";
import { useBaseExerciseData } from "./useBaseExerciseData";
import { useExerciseInputHandlers } from "./useExerciseInputHandlers";
import { useExerciseUIState } from "./useExerciseUIState";

export function useExerciseData(exerciseDetails: any[], routineId?: number) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  const {
    temporaryExercises,
    addTemporaryExercises,
    clearTemporaryExercises,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet
  } = useTemporaryExercises(routineId);

  const {
    previousData,
    exerciseNotesMap,
    previousDataLoaded
  } = usePreviousData(exerciseDetails);

  const {
    baseExerciseData,
    updateBaseExerciseData,
    isInitialized
  } = useBaseExerciseData({
    exerciseDetails,
    previousData,
    exerciseNotesMap,
    previousDataLoaded
  });

  const {
    showStatsDialog,
    isReorderMode,
    setShowStatsDialog,
    handleToggleReorderMode
  } = useExerciseUIState();

  // Combine base exercises with temporary exercises (optimized)
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log("Combining exercises - baseExerciseData keys:", Object.keys(baseExerciseData));
    console.log("Temporary exercises count:", temporaryExercises.length);
    
    // Create base exercises array preserving user data
    const baseExercisesArray = exerciseDetails.map(ex => {
      const preservedData = baseExerciseData[ex.id];
      if (preservedData) {
        console.log(`Using preserved data for exercise ${ex.id}:`, 
          preservedData.sets.map(s => ({ weight: s.weight, reps: s.reps, set_number: s.set_number })));
        return preservedData;
      }
      
      // Fallback - should rarely happen after fixes
      console.warn(`Fallback creation for exercise ${ex.id}`);
      return {
        id: ex.id,
        name: ex.name,
        sets: Array.from({ length: ex.sets || 1 }, (_, i) => ({
          set_number: i + 1,
          weight: null,
          reps: null,
          notes: "",
          previous_weight: null,
          previous_reps: null
        })),
        muscle_group_main: ex.muscle_group_main,
        equipment_required: ex.equipment_required,
        notes: ""
      };
    });

    // Combine with temporary exercises
    const allExercises = [...baseExercisesArray, ...temporaryExercises];
    setExercises(allExercises);
    
    console.log("Combined exercises:", {
      baseCount: baseExercisesArray.length,
      tempCount: temporaryExercises.length,
      totalCount: allExercises.length,
      baseExercisesWithData: baseExercisesArray.map(ex => ({ 
        id: ex.id, 
        name: ex.name, 
        setsWithData: ex.sets.filter(s => s.weight !== null || s.reps !== null).length,
        validSetNumbers: ex.sets.map(s => s.set_number)
      })),
      tempExercisesWithData: temporaryExercises.map(ex => ({ 
        id: ex.id, 
        name: ex.name, 
        setsWithData: ex.sets.filter(s => s.weight !== null || s.reps !== null).length,
        validSetNumbers: ex.sets.map(s => s.set_number)
      }))
    });
  }, [baseExerciseData, temporaryExercises, exerciseDetails, isInitialized]);

  const {
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet
  } = useExerciseInputHandlers({
    exercises,
    exerciseDetails,
    updateBaseExerciseData,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet
  });

  const handleReorderDrag = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setExercises(items);
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
