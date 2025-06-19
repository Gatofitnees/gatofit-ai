
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { saveRoutine, updateRoutine } from "../services/routineService";
import { useRoutineContext } from "../contexts/RoutineContext";
import { useRoutinePersistence } from "./useRoutinePersistence";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { toast as sonnerToast } from "sonner";

export const useRoutineSave = (editRoutineId?: number) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkRoutineLimit, showLimitReachedToast } = useUsageLimits();
  
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

  const handleSaveRoutineStart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Solo verificar límites si es una rutina nueva (no edición)
    if (!editRoutineId) {
      const limitCheck = await checkRoutineLimit(isPremium);
      
      if (!limitCheck.canProceed) {
        showLimitReachedToast('routines');
        return;
      }
    }
    
    if (routineExercises.length === 0) {
      setShowNoExercisesDialog(true);
      return;
    }
    
    setShowSaveConfirmDialog(true);
  }, [validateForm, routineExercises, setShowNoExercisesDialog, setShowSaveConfirmDialog, editRoutineId, checkRoutineLimit, isPremium, showLimitReachedToast]);

  const handleSaveRoutine = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      sonnerToast.loading(editRoutineId ? "Actualizando rutina..." : "Guardando rutina...");
      console.log(editRoutineId ? "Actualizando rutina existente" : "Guardando nueva rutina");

      let savedRoutine;
      
      if (editRoutineId) {
        savedRoutine = await updateRoutine(
          editRoutineId,
          routineName, 
          routineType, 
          routineExercises
        );
      } else {
        savedRoutine = await saveRoutine(
          routineName, 
          routineType, 
          routineExercises
        );

        // Solo incrementar contador para rutinas nuevas (no ediciones) y usuarios free
        if (savedRoutine && !isPremium) {
          await incrementUsage('routines');
        }
      }
      
      console.log(editRoutineId 
        ? "Rutina actualizada exitosamente:" 
        : "Rutina guardada exitosamente:", savedRoutine);
      
      sonnerToast.dismiss();
      
      setRoutineName('');
      setRoutineType('');
      setRoutineExercises([]);
      clearStoredRoutine();
      
      setShowSaveConfirmDialog(false);
      
      toast({
        title: editRoutineId ? "¡Rutina actualizada!" : "¡Rutina creada!",
        description: editRoutineId 
          ? `La rutina ${routineName} ha sido actualizada correctamente` 
          : `La rutina ${routineName} ha sido guardada correctamente`,
        variant: "success"
      });
      
      console.log("Navigating to /workout after successful save");
      navigate("/workout");
      
    } catch (error: any) {
      console.error(editRoutineId ? "Error actualizando rutina:" : "Error guardando rutina:", error);
      
      sonnerToast.dismiss();
      
      toast({
        title: editRoutineId ? "Error al actualizar" : "Error al guardar",
        description: error.message || "Ha ocurrido un error. Por favor, intente más tarde.",
        variant: "destructive"
      });
      
    } finally {
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
    setRoutineExercises,
    isPremium,
    incrementUsage
  ]);

  return {
    handleSaveRoutineStart,
    handleSaveRoutine,
  };
};
