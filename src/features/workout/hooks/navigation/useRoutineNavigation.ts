
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
    setShowDiscardChangesDialog,
    setPendingNavigation,
    pendingNavigation,
    setRoutineName,
    setRoutineType,
    setRoutineExercises
  } = useRoutineContext();

  // Get the function to clear the storage
  const { clearStoredRoutine } = useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
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
