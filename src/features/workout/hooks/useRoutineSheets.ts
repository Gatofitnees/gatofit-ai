
import { useCallback } from 'react';
import { useRoutineContext } from '../contexts/RoutineContext';

export const useRoutineSheets = () => {
  const { 
    setCurrentExerciseIndex,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
  } = useRoutineContext();

  const handleExerciseOptions = useCallback((index: number) => {
    setCurrentExerciseIndex(index);
    setShowExerciseOptionsSheet(true);
  }, [setCurrentExerciseIndex, setShowExerciseOptionsSheet]);

  const handleReorderClick = useCallback(() => {
    setShowReorderSheet(true);
  }, [setShowReorderSheet]);

  const handleReorderSave = useCallback(() => {
    setShowReorderSheet(false);
  }, [setShowReorderSheet]);

  return {
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave,
  };
};
