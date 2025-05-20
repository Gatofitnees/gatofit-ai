
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RoutineExercise } from "../types";
import { useRoutineForm } from "./useRoutineForm";
import { saveRoutine } from "../services/routineService";

// Key for storing routine state in session storage
const ROUTINE_SESSION_KEY = "currentRoutineData";

export const useCreateRoutine = (initialExercises: RoutineExercise[] = []) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNoExercisesDialog, setShowNoExercisesDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showExerciseOptionsSheet, setShowExerciseOptionsSheet] = useState(false);
  const [showReorderSheet, setShowReorderSheet] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [navigationPath, setNavigationPath] = useState<string | null>(null);
  
  // Attempt to load saved routine state from session storage
  const savedRoutineState = sessionStorage.getItem(ROUTINE_SESSION_KEY);
  const parsedState = savedRoutineState ? JSON.parse(savedRoutineState) : null;

  const initialFormState = {
    routineName: parsedState?.routineName || "",
    routineType: parsedState?.routineType || "",
    initialExercises: parsedState?.exercises || initialExercises
  };
  
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
  } = useRoutineForm(initialFormState.initialExercises);

  // Save current routine state to session storage when it changes
  useEffect(() => {
    if (routineName || routineType || routineExercises.length > 0) {
      const stateToSave = {
        routineName,
        routineType,
        exercises: routineExercises
      };
      sessionStorage.setItem(ROUTINE_SESSION_KEY, JSON.stringify(stateToSave));
    }
  }, [routineName, routineType, routineExercises]);

  // Function to check if we have unsaved changes
  const hasUnsavedChanges = () => {
    return routineName !== "" || routineType !== "" || routineExercises.length > 0;
  };

  // Updated navigation handler with unsaved changes check
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges()) {
      setNavigationPath(path);
      setShowUnsavedChangesDialog(true);
    } else {
      navigate(path);
    }
  };

  // Clear routine state and navigate
  const clearStateAndNavigate = () => {
    sessionStorage.removeItem(ROUTINE_SESSION_KEY);
    if (navigationPath) {
      navigate(navigationPath);
      setNavigationPath(null);
    }
  };

  // Updated to accept an optional event parameter to match the expected type
  const handleSelectExercises = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Prevent form submission if event is provided
    }
    
    // We'll save the state before navigating
    const stateToSave = {
      routineName,
      routineType,
      exercises: routineExercises
    };
    sessionStorage.setItem(ROUTINE_SESSION_KEY, JSON.stringify(stateToSave));
    
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
        variant: "success" // Change to success variant for better visual feedback
      });

      // Clear the session storage data since we've saved
      sessionStorage.removeItem(ROUTINE_SESSION_KEY);
      
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

  return {
    // State
    routineName,
    routineType,
    routineExercises,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    showUnsavedChangesDialog,
    currentExerciseIndex,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setRoutineExercises, 
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    setShowUnsavedChangesDialog,
    
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
    handleNavigation,
    clearStateAndNavigate,
    hasUnsavedChanges
  };
};
