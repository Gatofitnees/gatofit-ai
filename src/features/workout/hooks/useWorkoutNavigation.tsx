
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
    // Ahora pasamos la ruta de retorno como parámetro para volver a la pantalla correcta
    // Ya sea /workout/create para nuevas rutinas o /workout/edit/:id para edición
    if (routineId) {
      navigate(`/workout/select-exercises?returnTo=/workout/edit/${routineId}`);
    } else {
      navigate(`/workout/select-exercises?returnTo=/workout/create`);
    }
  };

  return {
    handleBack,
    handleViewExerciseDetails,
    handleAddExercise
  };
}
