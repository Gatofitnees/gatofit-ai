
import { useState, useCallback } from "react";
import { WorkoutExercise } from "../types/workout";
import { useBaseExerciseData } from "./useBaseExerciseData";
import { useExercisePreviousData } from "./useExercisePreviousData";
import { useExerciseInputHandlers } from "./useExerciseInputHandlers";
import { useExerciseUIState } from "./useExerciseUIState";
import { useTemporaryExercises } from "./useTemporaryExercises";

export function useExerciseData(exerciseDetails: any[], routineId?: number) {
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<number, string>>({});
  
  // Get exercise IDs for fetching previous data
  const exerciseIds = exerciseDetails.map(detail => detail.id);
  
  console.log("useExerciseData: exerciseIds for previous data:", exerciseIds);
  
  // Use general exercise previous data instead of routine-specific data
  const { exercisePreviousData, exercisePreviousLoaded } = useExercisePreviousData(exerciseIds);
  
  console.log("useExerciseData: exercisePreviousData:", exercisePreviousData);
  console.log("useExerciseData: exercisePreviousLoaded:", exercisePreviousLoaded);
  
  const { baseExerciseData, updateBaseExerciseData, clearStoredData } = useBaseExerciseData({
    exerciseDetails,
    previousData: exercisePreviousData,
    exerciseNotesMap,
    previousDataLoaded: exercisePreviousLoaded,
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
