
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

  const { temporaryExercises, addTemporaryExercises, clearTemporaryExercises } = useTemporaryExercises(routineId);
  
  const { 
    showStatsDialog, 
    isReorderMode, 
    setShowStatsDialog, 
    handleToggleReorderMode 
  } = useExerciseUIState();

  // Combine base exercises with temporary exercises
  const allExercises = Object.values(baseExerciseData).concat(temporaryExercises);

  const { handleInputChange, handleAddSet, handleReorderDrag } = useExerciseInputHandlers(
    allExercises,
    updateBaseExerciseData,
    temporaryExercises,
    addTemporaryExercises
  );

  const handleExerciseNotesChange = useCallback((exerciseId: number, notes: string) => {
    setExerciseNotesMap(prev => ({
      ...prev,
      [exerciseId]: notes
    }));
    
    // Update the exercise data
    const updateExercise = (prev: WorkoutExercise) => ({
      ...prev,
      notes
    });
    
    updateBaseExerciseData(exerciseId, updateExercise);
  }, [updateBaseExerciseData]);

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
