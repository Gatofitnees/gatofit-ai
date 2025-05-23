
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoutineContext } from "../contexts/RoutineContext";

export function useWorkoutNavigation(routineId?: number) {
  const navigate = useNavigate();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  
  // Wrap the useRoutineContext in a try-catch to handle cases where it might not be available
  // This makes the hook more resilient
  let routineExercises: any[] = [];
  try {
    const context = useRoutineContext();
    routineExercises = context.routineExercises;
  } catch (error) {
    // If context not available, fallback to empty array
    console.warn("RoutineContext not available, using fallback");
  }
  
  const handleBack = () => {
    // Show the discard changes dialog instead of window.confirm
    setShowDiscardDialog(true);
  };

  const confirmDiscardChanges = () => {
    // User confirmed to discard changes
    setShowDiscardDialog(false);
    navigate("/workout", { replace: true });
  };

  const cancelDiscardChanges = () => {
    // User canceled discard action
    setShowDiscardDialog(false);
  };

  const handleViewExerciseDetails = (exerciseId: number) => {
    navigate(`/workout/exercise-details/${exerciseId}`);
  };

  const handleAddExercise = () => {
    // Ahora pasamos la ruta de retorno como parámetro para volver a la pantalla correcta
    // Ya sea /workout/create para nuevas rutinas o /workout/edit/:id para edición
    const returnTo = routineId ? `/workout/edit/${routineId}` : "/workout/create";
    
    // Pasamos los ejercicios actuales para evitar duplicados
    navigate(`/workout/select-exercises?returnTo=${returnTo}`, {
      state: { currentExercises: routineExercises }
    });
  };

  return {
    handleBack,
    handleViewExerciseDetails,
    handleAddExercise,
    showDiscardDialog,
    confirmDiscardChanges,
    cancelDiscardChanges
  };
}
