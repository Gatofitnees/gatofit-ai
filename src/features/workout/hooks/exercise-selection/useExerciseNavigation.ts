
import { useNavigate, useLocation } from "react-router-dom";
import { ExerciseItem } from "../../types";

export const useExerciseNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return path from URL
  const getReturnPath = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo');
    return returnTo || '/workout/create';
  };
  
  // Check if this is from an active workout
  const isActiveWorkout = () => {
    return location.state?.isActiveWorkout === true;
  };
  
  const handleExerciseDetails = (id: number) => {
    // FIXED: Preserve current search and state when navigating to exercise details
    const currentSearch = location.search;
    const returnUrl = `/workout/select-exercises${currentSearch}`;
    
    console.log("Navigating to exercise details, return URL:", returnUrl);
    
    // Navigate to the exercise details page with preserved return path
    navigate(`/workout/exercise-details/${id}?returnTo=${encodeURIComponent(returnUrl)}`);
  };

  const handleNavigateBack = (resetSessionStorage: () => void) => {
    resetSessionStorage();
    navigate(getReturnPath());
  };

  const handleCreateExercise = () => {
    // FIXED: Preserve current search and state when navigating to create exercise
    const currentSearch = location.search;
    const returnUrl = `/workout/select-exercises${currentSearch}`;
    
    navigate(`/workout/create-exercise?returnTo=${encodeURIComponent(returnUrl)}`);
  };

  const handleAddExercises = (
    selectedExercises: number[], 
    allExercises: ExerciseItem[], 
    resetSessionStorage: () => void
  ) => {
    // Get the selected exercise objects
    const selectedExerciseObjects = allExercises.filter(exercise => 
      selectedExercises.includes(exercise.id)
    );
    
    // Add default sets to each exercise with 0 values (empty state)
    const exercisesWithSets = selectedExerciseObjects.map(exercise => ({
      ...exercise,
      sets: [
        {
          reps_min: 0,
          reps_max: 0,
          rest_seconds: 60
        }
      ]
    }));
    
    // Clear selected exercises from session storage
    resetSessionStorage();
    
    // Get the return path
    const returnPath = getReturnPath();
    
    // 🔥 CRITICAL: Get the currentBlockIndex from original location state
    const originalCurrentBlockIndex = location.state?.currentBlockIndex;
    
    console.log("🔥 [ADD_EXERCISES] Añadiendo ejercicios y volviendo a:", returnPath);
    console.log("🔥 [ADD_EXERCISES] Ejercicios seleccionados:", exercisesWithSets.length);
    console.log("🔥 [ADD_EXERCISES] Es entrenamiento activo:", isActiveWorkout());
    console.log("🔥 [ADD_EXERCISES] CurrentBlockIndex original:", originalCurrentBlockIndex);
    console.log("🔥 [ADD_EXERCISES] Tipo de currentBlockIndex:", typeof originalCurrentBlockIndex);
    
    // Navigate back with the selected exercises
    if (isActiveWorkout()) {
      // For active workouts, mark exercises as temporary
      navigate(returnPath, { 
        state: { 
          selectedExercises: exercisesWithSets,
          isTemporary: true, // Flag to indicate these are temporary exercises
          currentBlockIndex: originalCurrentBlockIndex // 🔥 PRESERVE BLOCK INDEX
        } 
      });
    } else {
      // For routine creation/editing, use the existing logic
      navigate(returnPath, { 
        state: { 
          selectedExercises: exercisesWithSets,
          shouldAddToExisting: true,
          currentBlockIndex: originalCurrentBlockIndex // 🔥 PRESERVE BLOCK INDEX
        } 
      });
    }
  };

  return {
    handleExerciseDetails,
    handleNavigateBack,
    handleCreateExercise,
    handleAddExercises
  };
};
