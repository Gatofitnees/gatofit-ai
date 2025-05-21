
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { saveRoutine } from "../services/routineService";
import { useRoutineContext } from "../contexts/RoutineContext";
import { useRoutinePersistence } from "./useRoutinePersistence";

export const useRoutineSave = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    routineName,
    routineType,
    routineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setIsSubmitting
  } = useRoutineContext();
  
  const { clearStoredRoutine } = useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    () => {}, // These are no-op functions since we're just using the clear functionality
    () => {},
    () => {}
  );

  // Validate form before saving
  const validateForm = useCallback(() => {
    if (!routineName) {
      toast({
        title: "Error",
        description: "Escribe un nombre a la rutina",
        variant: "destructive"
      });
      return false;
    }
    
    if (!routineType) {
      toast({
        title: "Error",
        description: "Selecciona el tipo de rutina",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }, [routineName, routineType, toast]);

  // Start the save routine process
  const handleSaveRoutineStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (routineExercises.length === 0) {
      setShowNoExercisesDialog(true);
      return;
    }
    
    setShowSaveConfirmDialog(true);
  }, [validateForm, routineExercises, setShowNoExercisesDialog, setShowSaveConfirmDialog]);

  // Save routine to database
  const handleSaveRoutine = useCallback(async () => {
    try {
      setIsSubmitting(true);
      console.log("Guardando rutina:", { routineName, routineType, routineExercises });

      const savedRoutine = await saveRoutine(routineName, routineType, routineExercises);
      console.log("Rutina guardada exitosamente:", savedRoutine);

      toast({
        title: "¡Rutina creada!",
        description: `La rutina ${routineName} ha sido guardada correctamente`,
        variant: "success"
      });

      // Clear form state from session storage after successful save
      clearStoredRoutine();
      
      // Navegar a /workout con replace: true para que el botón de retroceso no vuelva a la página de creación
      navigate("/workout", { replace: true });
    } catch (error) {
      console.error("Error saving routine:", error);
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar la rutina. Por favor, intente más tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setShowSaveConfirmDialog(false);
    }
  }, [routineName, routineType, routineExercises, navigate, toast, clearStoredRoutine, setIsSubmitting, setShowSaveConfirmDialog]);

  return {
    handleSaveRoutineStart,
    handleSaveRoutine,
  };
};
