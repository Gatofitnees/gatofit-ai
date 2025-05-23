
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoutineContext } from "../contexts/RoutineContext";
import { WorkoutExercise } from "../types/workout";

export function useWorkoutNavigation(routineId?: number, currentExercises?: WorkoutExercise[]) {
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
    // Determinar la ruta de retorno según el contexto
    let returnTo: string;
    let exercisesToPass: any[] = [];
    
    if (routineId) {
      // Si estamos en el contexto de una rutina (creación/edición)
      returnTo = routineId ? `/workout/edit/${routineId}` : "/workout/create";
      exercisesToPass = routineExercises;
    } else if (currentExercises && routineId) {
      // Si estamos en un entrenamiento activo con ID
      returnTo = `/workout/active/${routineId}`;
      exercisesToPass = currentExercises;
    } else if (currentExercises) {
      // Entrenamiento activo sin ID (fallback)
      returnTo = "/workout/active";
      exercisesToPass = currentExercises;
    } else {
      // Caso base (fallback)
      returnTo = "/workout/create";
      exercisesToPass = [];
    }
    
    // Navegar con el estado apropiado
    navigate(`/workout/select-exercises?returnTo=${returnTo}`, {
      state: { 
        currentExercises: exercisesToPass,
        isActiveWorkout: returnTo.includes("/workout/active/")
      }
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
