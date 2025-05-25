
import { useState, useCallback } from "react";
import { WorkoutExercise } from "../types/workout";
import { useBaseExerciseData } from "./useBaseExerciseData";
import { useRoutinePreviousData } from "./useRoutinePreviousData";
import { useExerciseInputHandlers } from "./useExerciseInputHandlers";
import { useExerciseUIState } from "./useExerciseUIState";
import { useTemporaryExercises } from "./useTemporaryExercises";

export function useExerciseData(exerciseDetails: any[], routineId?: number) {
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<number, string>>({});
  
  // Use routine-specific previous data instead of general exercise data
  const { routinePreviousData, routinePreviousLoaded } = useRoutinePreviousData(routineId);
  
  const { baseExerciseData, updateBaseExerciseData, clearStoredData } = useBaseExerciseData({
    exerciseDetails,
    previousData: routinePreviousData,
    exerciseNotesMap,
    previousDataLoaded: routinePreviousLoaded,
    routineId
  });

  const { 
    temporaryExercises, 
    addTemporaryExercises, 
    clearTemporaryExercises,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet
  } = useTemporaryExercises(routineId);
  
  const { 
    showStatsDialog, 
    isReorderMode, 
    setShowStatsDialog, 
    handleToggleReorderMode 
  } = useExerciseUIState();

  // Combine base exercises with temporary exercises
  const baseExercisesList = Object.values(baseExerciseData);
  const allExercises = baseExercisesList.concat(temporaryExercises);
  const baseExerciseCount = baseExercisesList.length;

  const { handleInputChange, handleAddSet, handleReorderDrag } = useExerciseInputHandlers(
    allExercises,
    updateBaseExerciseData,
    temporaryExercises,
    addTemporaryExercises,
    updateTemporaryExercise,
    addTemporaryExerciseSet,
    baseExerciseCount
  );

  const handleExerciseNotesChange = useCallback((exerciseIndex: number, notes: string) => {
    const exercise = allExercises[exerciseIndex];
    if (!exercise) return;

    // Check if this is a temporary exercise
    const isTemporary = exerciseIndex >= baseExerciseCount;

    if (isTemporary) {
      // Use temporary exercise notes update function
      const tempIndex = exerciseIndex - baseExerciseCount;
      updateTemporaryExerciseNotes(tempIndex, notes);
    } else {
      // Use base exercise notes update
      setExerciseNotesMap(prev => ({
        ...prev,
        [exercise.id]: notes
      }));
      
      // Update the exercise data
      const updateExercise = (prev: WorkoutExercise) => ({
        ...prev,
        notes
      });
      
      updateBaseExerciseData(exercise.id, updateExercise);
    }
  }, [allExercises, updateBaseExerciseData, updateTemporaryExerciseNotes, baseExerciseCount]);

  return {
    exercises: allExercises,
    showStatsDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleReorderDrag,
    setShowStatsDialog,
    handleToggleReorderMode,
    addTemporaryExercises,
    clearTemporaryExercises: () => {
      clearTemporaryExercises();
      clearStoredData();
    }
  };
}
