import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RoutineExercise } from "../types";
import { useRoutineForm } from "./useRoutineForm";
import { saveRoutine } from "../services/routineService";

// Session storage key for routine creation state
const ROUTINE_FORM_STORAGE_KEY = "routineFormState";

export const useCreateRoutine = (initialExercises: RoutineExercise[] = []) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNoExercisesDialog, setShowNoExercisesDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showExitConfirmDialog, setShowExitConfirmDialog] = useState(false);
  const [showExerciseOptionsSheet, setShowExerciseOptionsSheet] = useState(false);
  const [showReorderSheet, setShowReorderSheet] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [exitDestination, setExitDestination] = useState<string | null>(null);
  
  const {
    routineName,
    setRoutineName,
    routineType,
    setRoutineType,
    routineExercises,
    setRoutineExercises,
    validationErrors,
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    validateForm
  } = useRoutineForm(initialExercises);

  // Load form state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(ROUTINE_FORM_STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.routineName) setRoutineName(parsedState.routineName);
        if (parsedState.routineType) setRoutineType(parsedState.routineType);
        // Only load exercises if no exercises from location state
        if (parsedState.routineExercises?.length && !initialExercises.length) {
          setRoutineExercises(parsedState.routineExercises);
        }
      } catch (error) {
        console.error("Error parsing saved routine state:", error);
      }
    }
  }, []);

  // Save form state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      routineName,
      routineType,
      routineExercises
    };
    sessionStorage.setItem(ROUTINE_FORM_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [routineName, routineType, routineExercises]);

  // Updated to accept an optional event parameter to match the expected type
  const handleSelectExercises = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Prevent form submission if event is provided
    }
    navigate("/workout/select-exercises");
  };

  const handleExerciseOptions = (index: number) => {
    setCurrentExerciseIndex(index);
    setShowExerciseOptionsSheet(true);
  };

  const handleReorderClick = () => {
    setShowReorderSheet(true);
  };

  const handleReorderSave = () => {
    setShowReorderSheet(false);
  };

  const handleSaveRoutineStart = (e: React.MouseEvent) => {
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

  const handleSaveRoutine = async () => {
    setIsSubmitting(true);

    try {
      const savedRoutine = await saveRoutine(routineName, routineType, routineExercises);

      toast({
        title: "¡Rutina creada!",
        description: `La rutina ${routineName} ha sido guardada correctamente`,
        variant: "success",
      });

      // Clear session storage after successful save
      sessionStorage.removeItem(ROUTINE_FORM_STORAGE_KEY);
      
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
      setShowSaveConfirmDialog(false);
    }
  };
  
  const handleExitRoutineCreation = (destination: string) => {
    // If form is empty, navigate directly
    if (!routineName && !routineType && routineExercises.length === 0) {
      navigate(destination);
      return;
    }
    
    // Otherwise show confirmation dialog
    setExitDestination(destination);
    setShowExitConfirmDialog(true);
  };
  
  const confirmExit = () => {
    if (exitDestination) {
      // Clear session storage on confirmed exit
      sessionStorage.removeItem(ROUTINE_FORM_STORAGE_KEY);
      navigate(exitDestination);
    }
    setShowExitConfirmDialog(false);
  };
  
  const cancelExit = () => {
    setExitDestination(null);
    setShowExitConfirmDialog(false);
  };

  return {
    // State
    routineName,
    routineType,
    routineExercises,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showExitConfirmDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowExitConfirmDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    
    // Handlers
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    handleSelectExercises,
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave,
    handleSaveRoutineStart,
    handleSaveRoutine,
    handleExitRoutineCreation,
    confirmExit,
    cancelExit
  };
};
