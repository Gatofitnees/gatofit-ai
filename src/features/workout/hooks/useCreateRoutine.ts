
import { useBeforeUnload } from "react-router-dom";
import { useRoutinePersistence } from "./useRoutinePersistence";
import { useRoutineUI } from "./useRoutineUI";
import { useRoutineSave } from "./useRoutineSave";
import { RoutineExercise } from "../types";

export const useCreateRoutine = (initialExercises: RoutineExercise[] = []) => {
  // Use the extracted hooks
  const {
    routineName,
    routineType,
    routineExercises,
    validationErrors,
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    validateForm,
    handleSelectExercises,
    clearLocalStorage,
    setRoutineName,
    setRoutineType,
    setRoutineExercises
  } = useRoutinePersistence(initialExercises);

  const {
    isSubmitting,
    setIsSubmitting,
    showNoExercisesDialog,
    setShowNoExercisesDialog,
    showSaveConfirmDialog,
    setShowSaveConfirmDialog,
    showExitConfirmDialog,
    setShowExitConfirmDialog,
    showExerciseOptionsSheet,
    setShowExerciseOptionsSheet,
    showReorderSheet,
    setShowReorderSheet,
    currentExerciseIndex,
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave,
    handleAttemptNavigation,
    handleConfirmExit: baseHandleConfirmExit
  } = useRoutineUI();

  const { handleSaveRoutine: baseSaveRoutine, handleSaveRoutineStart: baseSaveRoutineStart } = useRoutineSave();

  // Warn before leaving the page if there are unsaved changes
  useBeforeUnload((event) => {
    if (routineName || routineType || routineExercises.length > 0) {
      event.preventDefault();
      return "¿Seguro que quieres salir? Perderás los cambios no guardados.";
    }
  });

  // Wrap the handle confirm exit to pass the clearLocalStorage function
  const handleConfirmExit = () => {
    baseHandleConfirmExit(clearLocalStorage);
  };

  // Wrap the save routine function to pass all required parameters
  const handleSaveRoutine = async () => {
    await baseSaveRoutine(
      routineName,
      routineType,
      routineExercises,
      clearLocalStorage,
      setIsSubmitting
    );
    setShowSaveConfirmDialog(false);
  };

  // Wrap the save routine start function to pass all required parameters
  const handleSaveRoutineStart = (e: React.MouseEvent) => {
    baseSaveRoutineStart(
      e,
      routineName,
      routineType,
      routineExercises,
      validateForm,
      setShowNoExercisesDialog,
      setShowSaveConfirmDialog
    );
  };
  
  return {
    // State
    routineName,
    routineType,
    routineExercises,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showExitConfirmDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowExitConfirmDialog,
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
    handleAttemptNavigation,
    handleConfirmExit
  };
};
