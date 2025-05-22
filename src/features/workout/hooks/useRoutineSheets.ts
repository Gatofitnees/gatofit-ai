
import { useCallback } from "react";
import { RoutineExercise } from "../types";
import { useToast } from "@/hooks/use-toast";

export const useRoutineSheets = (
  setShowExerciseOptionsSheet: (show: boolean) => void,
  setShowReorderSheet: (show: boolean) => void,
  setCurrentExerciseIndex: (index: number | null) => void
) => {
  const { toast } = useToast();
  
  // Handle opening the exercise options sheet
  const handleExerciseOptions = useCallback((index: number) => {
    setCurrentExerciseIndex(index);
    setShowExerciseOptionsSheet(true);
  }, [setCurrentExerciseIndex, setShowExerciseOptionsSheet]);

  // Handle opening the reorder sheet
  const handleReorderClick = useCallback(() => {
    setShowReorderSheet(true);
  }, [setShowReorderSheet]);

  // Handle saving the exercise order after reordering
  const handleReorderSave = useCallback(() => {
    setShowReorderSheet(false);
    
    // Show a toast notification when reordering is saved
    toast({
      title: "Orden actualizado",
      description: "El orden de los ejercicios ha sido actualizado",
    });
  }, [setShowReorderSheet, toast]);

  return {
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave
  };
};
