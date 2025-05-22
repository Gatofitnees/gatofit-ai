
import { useCallback } from "react";
import { RoutineExercise } from "../types";

export const useRoutineSheets = (
  setShowExerciseOptionsSheet: (show: boolean) => void,
  setShowReorderSheet: (show: boolean) => void,
  setCurrentExerciseIndex: (index: number | null) => void
) => {
  // Handle opening the exercise options sheet
  const handleExerciseOptions = useCallback((index: number) => {
    setCurrentExerciseIndex(index);
    setShowExerciseOptionsSheet(true);
  }, [setCurrentExerciseIndex, setShowExerciseOptionsSheet]);

  // Handle opening the reorder sheet
  const handleReorderClick = useCallback(() => {
    setShowReorderSheet(true);
  }, [setShowReorderSheet]);

  // Handle saving the exercise order after reordering
  const handleReorderSave = useCallback(() => {
    setShowReorderSheet(false);
  }, [setShowReorderSheet]);

  return {
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave
  };
};
