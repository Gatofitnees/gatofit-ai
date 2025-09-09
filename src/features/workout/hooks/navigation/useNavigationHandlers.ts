
import { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { RoutineNavigationState, RoutineNavigationActions } from './types';

interface NavigationHandlersProps extends RoutineNavigationState {
  clearStoredRoutine: () => void;
  navigate: NavigateFunction;
  editRoutineId?: number;
}

export const useNavigationHandlers = ({
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
}: NavigationHandlersProps): RoutineNavigationActions => {
  // Handle navigation when there might be unsaved changes
  const handleNavigateAway = useCallback((targetPath: string) => {
    // Only show confirmation if form has been filled out
    const hasChanges = routineName !== "" || routineType !== "" || routineExercises.length > 0;
    
    if (hasChanges) {
      setPendingNavigation(targetPath);
      setShowDiscardChangesDialog(true);
      return false;
    }
    
    return true;
  }, [routineName, routineType, routineExercises, setPendingNavigation, setShowDiscardChangesDialog]);

  // Handle back button click with confirmation if needed
  const handleBackClick = useCallback(() => {
    const hasChanges = routineName !== "" || routineType !== "" || routineExercises.length > 0;
    
    if (hasChanges) {
      setShowDiscardChangesDialog(true);
      return;
    }
    
    // No changes, navigate directly
    navigate("/workout");
  }, [routineName, routineType, routineExercises, navigate, setShowDiscardChangesDialog]);

  // Navigate to select exercises page
  const handleSelectExercises = useCallback((e?: React.MouseEvent, blockIndex?: number) => {
    if (e) {
      e.preventDefault();
    }
    
    // Pass the return URL based on whether we're in edit mode or create mode
    const returnPath = editRoutineId ? `/workout/edit/${editRoutineId}` : "/workout/create";
    
    console.log("🔵 [NAVIGATION] Navegando con blockIndex:", blockIndex);
    console.log("🔵 [NAVIGATION] Tipo de blockIndex:", typeof blockIndex);
    console.log("🔵 [NAVIGATION] Es número válido:", typeof blockIndex === 'number' && blockIndex >= 0);
    
    const navigationState = {
      currentExercises: routineExercises,
      currentBlockIndex: blockIndex,
      shouldAddToExisting: true
    };
    
    console.log("🔵 [NAVIGATION] Estado de navegación:", navigationState);
    
    navigate(`/workout/select-exercises?returnTo=${returnPath}`, {
      state: navigationState
    });
  }, [navigate, editRoutineId, routineExercises]);

  // Handle navigating when discard is confirmed
  const handleDiscardChanges = useCallback(() => {
    // Reset form state in context
    setRoutineName('');
    setRoutineType('');
    setRoutineExercises([]);
    
    // Clear form state from session storage after discarding
    clearStoredRoutine();
    
    // Navigate to the pending route if there is one
    if (pendingNavigation) {
      navigate(pendingNavigation);
    } else {
      navigate("/workout");
    }
    
    setShowDiscardChangesDialog(false);
  }, [
    pendingNavigation, 
    navigate, 
    setShowDiscardChangesDialog, 
    clearStoredRoutine,
    setRoutineName,
    setRoutineType,
    setRoutineExercises
  ]);

  return {
    handleNavigateAway,
    handleBackClick,
    handleSelectExercises,
    handleDiscardChanges,
  };
};
