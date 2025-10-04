
import { useState, useCallback, useEffect } from "react";
import { WorkoutExercise } from "../types/workout";
import { useBaseExerciseData } from "./useBaseExerciseData";
import { usePreviousData } from "./usePreviousData";
import { useExerciseInputHandlers } from "./useExerciseInputHandlers";
import { useExerciseUIState } from "./useExerciseUIState";
import { useTemporaryExercises } from "./useTemporaryExercises";

export function useExerciseData(exerciseDetails: any[], routineId?: number, cachedData?: any) {
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<number, string>>({});
  
  // Use general exercise history (not limited to specific routine)
  const { previousData, exerciseNotesMap: previousNotesMap, previousDataLoaded } = usePreviousData(exerciseDetails);
  
  const { baseExerciseData, updateBaseExerciseData, clearStoredData } = useBaseExerciseData({
    exerciseDetails,
    previousData,
    exerciseNotesMap,
    previousDataLoaded,
    routineId,
    cachedBaseExercises: cachedData?.baseExercises
  });

  const { 
    temporaryExercises, 
    addTemporaryExercises, 
    clearTemporaryExercises,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet,
    setTemporaryExercises
  } = useTemporaryExercises(routineId);

  // Load cached temporary exercises if available
  useEffect(() => {
    if (cachedData?.temporaryExercises && cachedData.temporaryExercises.length > 0 && temporaryExercises.length === 0) {
      console.log("🔄 Restoring temporary exercises from cache");
      setTemporaryExercises(cachedData.temporaryExercises);
    }
  }, [cachedData, setTemporaryExercises, temporaryExercises.length]);
  
  const { 
    showStatsDialog, 
    isReorderMode, 
    setShowStatsDialog, 
    handleToggleReorderMode 
  } = useExerciseUIState();

  // Create ordered base exercises list based on exerciseDetails order
  const getOrderedBaseExercises = useCallback(() => {
    return exerciseDetails
      .map(detail => baseExerciseData[detail.id])
      .filter(Boolean); // Remove any undefined entries
  }, [exerciseDetails, baseExerciseData]);

  // Combine base exercises with temporary exercises, preserving order
  const baseExercisesList = getOrderedBaseExercises();
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
      // Update the exercise data - user workout notes, not routine creator notes
      const updateExercise = (prev: WorkoutExercise) => ({
        ...prev,
        user_notes: notes // Update user workout notes, not routine creator notes
      });
      
      updateBaseExerciseData(exercise.id, updateExercise);
    }
  }, [allExercises, updateBaseExerciseData, updateTemporaryExerciseNotes, baseExerciseCount]);

  return {
    exercises: allExercises,
    baseExercises: baseExerciseData,
    temporaryExercises,
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
