
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoutineContext } from '../contexts/RoutineContext';
import { useRoutinePersistence } from './useRoutinePersistence';

export const useRoutineNavigation = () => {
  const navigate = useNavigate();
  const { 
    routineName, 
    routineType, 
    routineExercises, 
    setShowDiscardChangesDialog,
    setPendingNavigation,
    pendingNavigation
  } = useRoutineContext();

  // Obtener la función para limpiar el almacenamiento
  const { clearStoredRoutine } = useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    () => {}, // Estas son funciones no-op ya que solo usamos la funcionalidad de limpieza
    () => {},
    () => {}
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
    navigate("/workout/select-exercises");
  }, [navigate]);

  // Handle navigating when discard is confirmed
  const handleDiscardChanges = useCallback(() => {
    // Limpiar el storage de la rutina para que no persista
    clearStoredRoutine();
    
    // Navigate to the pending route if there is one
    if (pendingNavigation) {
      navigate(pendingNavigation);
    } else {
      navigate("/workout");
    }
    
    setShowDiscardChangesDialog(false);
  }, [pendingNavigation, navigate, setShowDiscardChangesDialog, clearStoredRoutine]);

  return {
    handleNavigateAway,
    handleBackClick,
    handleSelectExercises,
    handleDiscardChanges,
  };
};
