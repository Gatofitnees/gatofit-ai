
import { useState, useCallback, useMemo } from "react";
import { WorkoutExercise } from "../types/workout";
import { useBaseExerciseData } from "./useBaseExerciseData";
import { useExercisePreviousData } from "./useExercisePreviousData";
import { useExerciseInputHandlers } from "./useExerciseInputHandlers";
import { useExerciseUIState } from "./useExerciseUIState";
import { useTemporaryExercises } from "./useTemporaryExercises";

export function useExerciseData(exerciseDetails: any[], routineId?: number) {
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<number, string>>({});
  
  // Extract exercise IDs from exerciseDetails
  const exerciseIds = useMemo(() => 
    exerciseDetails.map(detail => detail.exercise_id).filter(Boolean),
    [exerciseDetails]
  );
  
  // Use exercise-specific previous data from any routine
  const { exercisePreviousData, exercisePreviousLoaded } = useExercisePreviousData(exerciseIds);
  
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
