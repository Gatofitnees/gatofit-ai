
import { useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RoutineExercise } from "../types";
import { toast } from "sonner";
import { WorkoutExercise } from "../types/workout";

export function useWorkoutNavigation(
  routineId: number | undefined,
  appendExercises?: (exercises: RoutineExercise[] | WorkoutExercise[]) => void
) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleViewExerciseDetails = useCallback((exerciseId: number) => {
    // Save current URL to return to after viewing details
    const returnPath = location.pathname + location.search;
    navigate(`/workout/exercise-details/${exerciseId}?returnTo=${encodeURIComponent(returnPath)}`);
  }, [navigate, location]);

  const handleAddExercise = useCallback(() => {
    // Determine if we're on the active workout screen or creating a routine
    const isActiveWorkout = location.pathname.includes('/active');
    const returnPath = location.pathname + location.search;
    
    navigate(`/workout/select-exercises?returnTo=${encodeURIComponent(returnPath)}${routineId ? `&routineId=${routineId}` : ''}`);
  }, [navigate, location, routineId]);

  // This function will be called when returning from select-exercises with new exercises
  useEffect(() => {
    const handleLocationState = () => {
      const state = location.state as { selectedExercises?: RoutineExercise[] } | null;
      
      if (state?.selectedExercises && appendExercises) {
        appendExercises(state.selectedExercises);
        
        // Show confirmation toast
        toast.success("Ejercicios añadidos correctamente");
        
        // Clear the location state to avoid duplicate additions
        navigate(location.pathname + location.search, { replace: true });
      }
    };
    
    handleLocationState();
  }, [location, appendExercises, navigate]);

  return {
    handleBack,
    handleViewExerciseDetails,
    handleAddExercise
  };
}
