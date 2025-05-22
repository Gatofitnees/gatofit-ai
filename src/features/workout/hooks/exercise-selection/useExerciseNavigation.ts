
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
  
  const handleExerciseDetails = (id: number) => {
    // Navigate to the exercise details page
    navigate(`/workout/exercise-details/${id}?returnTo=${encodeURIComponent('/workout/select-exercises' + location.search)}`);
  };

  const handleNavigateBack = (resetSessionStorage: () => void) => {
    resetSessionStorage();
    navigate(getReturnPath());
  };

  const handleCreateExercise = () => {
    navigate("/workout/create-exercise?returnTo=" + encodeURIComponent('/workout/select-exercises' + location.search));
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
    
    // Add default sets to each exercise
    const exercisesWithSets = selectedExerciseObjects.map(exercise => ({
      ...exercise,
      sets: [
        {
          reps_min: 8,
          reps_max: 12,
          rest_seconds: 60
        }
      ]
    }));
    
    // Clear selected exercises from session storage
    resetSessionStorage();
    
    // Get the return path
    const returnPath = getReturnPath();
    
    // Get current routine exercises to pass them along to maintain state
    // This is important for when a user has already selected exercises previously
    let currentRoutineState = null;
    
    // Retrieve current routine data from session storage
    const routineId = returnPath.includes('edit/') ? returnPath.split('edit/')[1] : undefined;
    const storageKey = routineId ? `createRoutineState_${routineId}` : "createRoutineState";
    const savedRoutineState = sessionStorage.getItem(storageKey);
    
    if (savedRoutineState) {
      try {
        const parsedState = JSON.parse(savedRoutineState);
        if (parsedState.exercises && parsedState.exercises.length > 0) {
          currentRoutineState = parsedState.exercises;
        }
      } catch (error) {
        console.error("Error parsing saved routine state:", error);
      }
    }
    
    console.log("Añadiendo ejercicios y volviendo a:", returnPath);
    console.log("Ejercicios seleccionados:", exercisesWithSets.length);
    
    // Navigate back with the selected exercises AND the current state
    navigate(returnPath, { 
      state: { 
        selectedExercises: exercisesWithSets,
        currentExercises: currentRoutineState // Pass current exercises for reference 
      } 
    });
  };

  return {
    handleExerciseDetails,
    handleNavigateBack,
    handleCreateExercise,
    handleAddExercises
  };
};
