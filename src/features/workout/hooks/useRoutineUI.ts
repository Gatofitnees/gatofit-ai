
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useRoutineUI() {
  const navigate = useNavigate();
  const [showNoExercisesDialog, setShowNoExercisesDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showExitConfirmDialog, setShowExitConfirmDialog] = useState(false);
  const [showExerciseOptionsSheet, setShowExerciseOptionsSheet] = useState(false);
  const [showReorderSheet, setShowReorderSheet] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [attemptingNavigation, setAttemptingNavigation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExerciseOptions = (index: number) => {
    setCurrentExerciseIndex(index);
    setShowExerciseOptionsSheet(true);
  };

  const handleReorderClick = () => {
    setShowReorderSheet(true);
  };

  const handleReorderSave = () => {
    setShowReorderSheet(false);
  };

  const handleAttemptNavigation = (path: string) => {
    setAttemptingNavigation(path);
    setShowExitConfirmDialog(true);
  };

  const handleConfirmExit = (clearLocalStorage: () => void) => {
    if (attemptingNavigation) {
      navigate(attemptingNavigation);
      clearLocalStorage();
    }
    setShowExitConfirmDialog(false);
    setAttemptingNavigation(null);
  };

  return {
    // UI state
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
    setCurrentExerciseIndex,
    attemptingNavigation,
    
    // UI handlers
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave,
    handleAttemptNavigation,
    handleConfirmExit
  };
}
