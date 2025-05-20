
import { useCallback } from "react";
import { useRoutineContext } from "../contexts/RoutineContext";
import { useRoutinePersistence } from "./useRoutinePersistence";
import { useRoutineNavigation } from "./useRoutineNavigation";
import { useRoutineSheets } from "./useRoutineSheets";
import { useRoutineSave } from "./useRoutineSave";
import { useRoutineForm } from "./useRoutineForm";
import { RoutineExercise } from "../types";

export const useCreateRoutine = (initialExercises: RoutineExercise[] = []) => {
  // Get context state and setters
  const { 
    routineName,
    routineType,
    routineExercises,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
  } = useRoutineContext();

  // Initialize form handling
  const {
    validationErrors,
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
  } = useRoutineForm(
    routineExercises, 
    routineName, 
    routineType, 
    setRoutineExercises
  );
  
  // Set up persistence
  useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    setRoutineName,
    setRoutineType,
    setRoutineExercises
  );
  
  // Set up navigation handlers
  const { 
    handleNavigateAway,
    handleBackClick,
    handleSelectExercises,
    handleDiscardChanges 
  } = useRoutineNavigation();
  
  // Set up sheet handlers
  const { 
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave 
  } = useRoutineSheets();
  
  // Set up save handlers
  const { 
    handleSaveRoutineStart,
    handleSaveRoutine 
  } = useRoutineSave();

  return {
    // State
    routineName,
    routineType,
    routineExercises,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    
    // Handlers
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    handleSelectExercises,
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave,
    handleSaveRoutineStart,
    handleSaveRoutine,
    handleDiscardChanges,
    handleNavigateAway,
    handleBackClick
  };
};
