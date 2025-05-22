
import { useNavigate } from "react-router-dom";

export function useWorkoutNavigation(routineId?: number) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    const confirmLeave = window.confirm(
      "¿Estás seguro de que deseas abandonar el entrenamiento? Los datos no guardados se perderán."
    );
    
    if (confirmLeave) {
      navigate("/workout");
    }
  };

  const handleViewExerciseDetails = (exerciseId: number) => {
    navigate(`/workout/exercise-details/${exerciseId}`);
  };

  const handleAddExercise = () => {
    navigate(`/workout/select-exercises?returnTo=/workout/active/${routineId}`);
  };

  return {
    handleBack,
    handleViewExerciseDetails,
    handleAddExercise
  };
}
