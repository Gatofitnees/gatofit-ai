
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
    setIsSubmitting,
    setRoutineName,
    setRoutineType,
    setRoutineExercises
  } = useRoutineContext();
  
  const { clearStoredRoutine } = useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    setRoutineName,
    setRoutineType,
    setRoutineExercises
  );

  // Validate form before saving
  const validateForm = useCallback(() => {
    if (!routineName || routineName.trim() === '') {
      toast({
        title: "Error",
        description: "Escribe un nombre a la rutina",
        variant: "destructive"
      });
      return false;
    }
    
    if (!routineType || routineType.trim() === '') {
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
      console.log("Guardando rutina:", { routineName, routineType, exercises: routineExercises.length });

      const savedRoutine = await saveRoutine(routineName, routineType, routineExercises);
      console.log("Rutina guardada exitosamente:", savedRoutine);

      // Show success toast
      toast({
        title: "¡Rutina creada!",
        description: `La rutina ${routineName} ha sido guardada correctamente`,
        variant: "success"
      });

      // Reset form state in context
      setRoutineName('');
      setRoutineType('');
      setRoutineExercises([]);
      
      // Clear form state from session storage after successful save
      clearStoredRoutine();
      
      // Set a timeout to ensure the toast is visible before navigating
      setTimeout(() => {
        // Navigate to /workout with replace: true to prevent going back to the creation page
        navigate("/workout", { replace: true });
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error: any) {
      console.error("Error saving routine:", error);
      toast({
        title: "Error al guardar",
        description: error.message || "Ha ocurrido un error al guardar la rutina. Por favor, intente más tarde.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      setShowSaveConfirmDialog(false);
    }
  }, [
    routineName, 
    routineType, 
    routineExercises, 
    navigate, 
    toast, 
    clearStoredRoutine, 
    setIsSubmitting, 
    setShowSaveConfirmDialog,
    setRoutineName,
    setRoutineType,
    setRoutineExercises
  ]);

  return {
    handleSaveRoutineStart,
    handleSaveRoutine,
  };
};
