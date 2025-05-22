
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoutineContext } from '../contexts/RoutineContext';
import { useRoutinePersistence } from './useRoutinePersistence';

export const useRoutineNavigation = (editRoutineId?: number) => {
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

  // Obtener la función para limpiar el almacenamiento
  const { clearStoredRoutine } = useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    editRoutineId
  );

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
  const handleSelectExercises = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Pasamos la URL de retorno según si estamos en modo edición o creación
    const returnPath = editRoutineId ? `/workout/edit/${editRoutineId}` : "/workout/create";
    navigate(`/workout/select-exercises?returnTo=${returnPath}`);
  }, [navigate, editRoutineId]);

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
