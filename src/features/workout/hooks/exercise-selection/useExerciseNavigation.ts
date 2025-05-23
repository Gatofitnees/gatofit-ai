
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
    
    console.log("Añadiendo ejercicios y volviendo a:", returnPath);
    console.log("Ejercicios seleccionados:", exercisesWithSets.length);
    
    // Navigate back with the selected exercises
    // IMPORTANTE: Siempre establecemos shouldAddToExisting en true para asegurar que se añadan a los existentes
    navigate(returnPath, { 
      state: { 
        selectedExercises: exercisesWithSets,
        shouldAddToExisting: true // Siempre true para añadir a los ejercicios existentes
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
