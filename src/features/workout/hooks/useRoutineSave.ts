
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { saveRoutine, updateRoutine } from "../services/routineService";
import { useRoutineContext } from "../contexts/RoutineContext";
import { useRoutinePersistence } from "./useRoutinePersistence";
import { toast as sonnerToast } from "sonner";

export const useRoutineSave = (editRoutineId?: number) => {
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
    setRoutineExercises,
    editRoutineId
  );

  // Validate form before saving
  const validateForm = useCallback(() => {
    let valid = true;
    let errorMessage = "";
    
    if (!routineName || routineName.trim() === '') {
      valid = false;
      errorMessage = "Debes escribir un nombre para la rutina";
    } else if (!routineType || routineType.trim() === '') {
      valid = false;
      errorMessage = "Debes seleccionar el tipo de rutina";
    }
    
    if (!valid) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
    
    return valid;
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

  // Save routine to database - improved for better reliability and feedback
  const handleSaveRoutine = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      // Show saving notification
      sonnerToast.loading(editRoutineId ? "Actualizando rutina..." : "Guardando rutina...");
      console.log(editRoutineId ? "Actualizando rutina existente" : "Guardando nueva rutina");

      let savedRoutine;
      
      if (editRoutineId) {
        // Actualizar rutina existente
        savedRoutine = await updateRoutine(
          editRoutineId,
          routineName, 
          routineType, 
          routineExercises
        );
      } else {
        // Guardar nueva rutina
        savedRoutine = await saveRoutine(
          routineName, 
          routineType, 
          routineExercises
        );
      }
      
      console.log(editRoutineId 
        ? "Rutina actualizada exitosamente:" 
        : "Rutina guardada exitosamente:", savedRoutine);
      
      // Hide loading notification
      sonnerToast.dismiss();
      
      // Reset form state to avoid state issues
      setRoutineName('');
      setRoutineType('');
      setRoutineExercises([]);
      clearStoredRoutine();
      
      // Close dialog
      setShowSaveConfirmDialog(false);
      
      // Show success toast
      toast({
        title: editRoutineId ? "¡Rutina actualizada!" : "¡Rutina creada!",
        description: editRoutineId 
          ? `La rutina ${routineName} ha sido actualizada correctamente` 
          : `La rutina ${routineName} ha sido guardada correctamente`,
        variant: "success"
      });
      
      // Navigate immediately after successful save
      console.log("Navigating to /workout after successful save");
      navigate("/workout");
      
    } catch (error: any) {
      console.error(editRoutineId ? "Error actualizando rutina:" : "Error guardando rutina:", error);
      
      // Hide loading notification
      sonnerToast.dismiss();
      
      // Show error toast
      toast({
        title: editRoutineId ? "Error al actualizar" : "Error al guardar",
        description: error.message || "Ha ocurrido un error. Por favor, intente más tarde.",
        variant: "destructive"
      });
      
    } finally {
      // Reset submission state
      setIsSubmitting(false);
      setShowSaveConfirmDialog(false);
    }
  }, [
    editRoutineId,
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
