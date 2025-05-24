import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRoutineDetail } from "./useRoutineDetail";
import { useExerciseData } from "./useExerciseData";
import { useSaveWorkout } from "./useSaveWorkout";
import { useWorkoutNavigation } from "./useWorkoutNavigation";

export function useActiveWorkout(routineId: number | undefined) {
  const [workoutStartTime] = useState<Date>(new Date());
  const location = useLocation();
  const { routine, exerciseDetails, loading } = useRoutineDetail(routineId);
  
  const {
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
  } = useExerciseData(exerciseDetails, routineId);

  const {
    isSaving,
    handleSaveWorkout: originalSaveWorkout
  } = useSaveWorkout(routine, workoutStartTime, exercises, clearTemporaryExercises, routineId);

  const {
    handleBack: originalHandleBack,
    handleViewExerciseDetails,
    handleAddExercise: originalHandleAddExercise,
    showDiscardDialog,
    confirmDiscardChanges: originalConfirmDiscardChanges,
    cancelDiscardChanges
  } = useWorkoutNavigation(routineId);

  // Handle incoming temporary exercises from exercise selection with improved logic
  useEffect(() => {
    if (location.state?.selectedExercises && location.state?.isTemporary) {
      console.log("Processing selected temporary exercises:", location.state.selectedExercises);
      addTemporaryExercises(location.state.selectedExercises);
      
      // Clear the state immediately to prevent re-adding on re-renders
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state?.selectedExercises, location.state?.isTemporary, addTemporaryExercises]);

  // Enhanced handleBack to clear temporary exercises
  const handleBack = () => {
    clearTemporaryExercises();
    originalHandleBack();
  };

  // Enhanced confirmDiscardChanges to clear temporary exercises
  const confirmDiscardChanges = () => {
    clearTemporaryExercises();
    originalConfirmDiscardChanges();
  };

  // Enhanced handleAddExercise to pass current exercises
  const handleAddExercise = () => {
    originalHandleAddExercise(exercises);
  };

  // Enhanced handleSaveWorkout - remove the immediate clearing
  const handleSaveWorkout = async () => {
    try {
      await originalSaveWorkout();
      // clearTemporaryExercises is now handled inside useSaveWorkout after navigation
    } catch (error) {
      console.error("Error saving workout:", error);
      // Don't clear temporary exercises if save failed
    }
  };

  return {
    routine,
    exercises,
    loading,
    isSaving,
    showStatsDialog,
    showDiscardDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleBack,
    handleSaveWorkout,
    handleReorderDrag,
    handleViewExerciseDetails,
    handleAddExercise,
    confirmDiscardChanges,
    cancelDiscardChanges,
    setShowStatsDialog,
    handleToggleReorderMode,
    workoutStartTime
  };
}
