
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RoutineExercise } from "../types";
import { saveRoutine } from "../services/routineService";

export function useRoutineSave() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSaveRoutine = async (
    routineName: string,
    routineType: string,
    routineExercises: RoutineExercise[],
    clearLocalStorage: () => void,
    setIsSubmitting: (value: boolean) => void
  ) => {
    setIsSubmitting(true);

    try {
      const savedRoutine = await saveRoutine(routineName, routineType, routineExercises);

      toast({
        title: "¡Rutina creada!",
        description: `La rutina ${routineName} ha sido guardada correctamente`,
        variant: "success",
      });

      clearLocalStorage();
      navigate("/workout", { replace: true });
    } catch (error) {
      console.error("Error saving routine:", error);
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar la rutina",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRoutineStart = (
    e: React.MouseEvent,
    routineName: string,
    routineType: string,
    routineExercises: RoutineExercise[],
    validateForm: () => boolean,
    setShowNoExercisesDialog: (show: boolean) => void,
    setShowSaveConfirmDialog: (show: boolean) => void
  ) => {
    e.preventDefault(); // Prevent form submission
    
    if (!validateForm()) {
      return;
    }
    
    if (routineExercises.length === 0) {
      setShowNoExercisesDialog(true);
      return;
    }
    
    setShowSaveConfirmDialog(true);
  };

  return {
    handleSaveRoutine,
    handleSaveRoutineStart
  };
}
