
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

  const handleAddExercise = (currentExercises?: any[]) => {
    // Check if we're in an active workout by checking if routineId is provided
    if (routineId) {
      // We're in an active workout, navigate to select exercises with return path to active workout
      const returnTo = `/workout/active/${routineId}`;
      
      navigate(`/workout/select-exercises?returnTo=${returnTo}`, {
        state: { 
          currentExercises: currentExercises || [],
          isActiveWorkout: true // Flag to indicate this is from an active workout
        }
      });
    } else {
      // Original logic for routine creation/editing
      const returnTo = routineId ? `/workout/edit/${routineId}` : "/workout/create";
      
      navigate(`/workout/select-exercises?returnTo=${returnTo}`, {
        state: { currentExercises: routineExercises }
      });
    }
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
