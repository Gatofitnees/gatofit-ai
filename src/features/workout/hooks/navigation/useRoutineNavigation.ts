
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoutineContext } from '../../contexts/RoutineContext';
import { useRoutinePersistence } from '../useRoutinePersistence';
import { useNavigationHandlers } from './useNavigationHandlers';
import { RoutineNavigationOptions, RoutineNavigationActions } from './types';

export const useRoutineNavigation = (
  editRoutineId?: number
): RoutineNavigationActions => {
  const navigate = useNavigate();
  const { 
    routineName, 
    routineType, 
    routineExercises,
    workoutBlocks,
    currentBlockForExercises,
    setShowDiscardChangesDialog,
    setPendingNavigation,
    pendingNavigation,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setWorkoutBlocks
  } = useRoutineContext();

  // Get the function to clear the storage
  const { clearStoredRoutine } = useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    workoutBlocks,
    currentBlockForExercises,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setWorkoutBlocks,
    () => {}, // addExercisesToBlock - not needed here
    editRoutineId
  );

  // Get navigation handlers
  const navigationHandlers = useNavigationHandlers({
    routineName,
    routineType,
    routineExercises,
    pendingNavigation,
    setShowDiscardChangesDialog,
    setPendingNavigation,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    clearStoredRoutine,
    navigate,
    editRoutineId
  });

  return navigationHandlers;
};
