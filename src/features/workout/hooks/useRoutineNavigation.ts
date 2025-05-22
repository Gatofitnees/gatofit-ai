
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRoutineContext } from '../contexts/RoutineContext';
import { useRoutinePersistence } from './useRoutinePersistence';
import { useToast } from "@/hooks/use-toast";

export const useRoutineNavigation = (editRoutineId?: number) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
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

  // Navigate to select exercises page - preserve current routine state
  const handleSelectExercises = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    console.log("handleSelectExercises called");
    
    // Verificar si la ruta actual ya tiene ejercicios seleccionados
    const locationState = location.state as { selectedExercises?: any[] } | undefined;
    console.log("Location state:", locationState);
    
    if (locationState?.selectedExercises && Array.isArray(locationState.selectedExercises)) {
      // Si hay ejercicios seleccionados en el state (provenientes de la página de detalles)
      console.log("Selected exercises from state:", locationState.selectedExercises);
      
      const newExercises = locationState.selectedExercises.map(ex => ({
        ...ex,
        sets: ex.sets || [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
      }));
      
      console.log("New exercises to add:", newExercises);
      
      // Añadir los ejercicios seleccionados a los actuales
      setRoutineExercises([...routineExercises, ...newExercises]);
      
      // Mostrar notificación
      toast({
        title: "Ejercicio añadido",
        description: `${newExercises.length} ejercicio(s) añadido(s) a la rutina`,
      });
      
      // Limpiar el state para evitar duplicados si el usuario refresca
      window.history.replaceState({}, document.title);
      return;
    }
    
    // Save current state before navigating
    const stateToSave = {
      name: routineName,
      type: routineType,
      exercises: routineExercises
    };
    
    console.log("Saving routine state to sessionStorage:", stateToSave);
    
    const storageKey = editRoutineId ? `createRoutineState_${editRoutineId}` : "createRoutineState";
    sessionStorage.setItem(storageKey, JSON.stringify(stateToSave));
    
    // Pasamos la URL de retorno según si estamos en modo edición o creación
    const returnPath = editRoutineId ? `/workout/edit/${editRoutineId}` : "/workout/create";
    navigate(`/workout/select-exercises?returnTo=${returnPath}`);
  }, [
    navigate, 
    editRoutineId, 
    routineName, 
    routineType, 
    routineExercises, 
    setRoutineExercises, 
    location.state,
    toast
  ]);

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
