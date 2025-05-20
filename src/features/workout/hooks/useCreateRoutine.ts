
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useBeforeUnload } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RoutineExercise } from "../types";
import { useRoutineForm } from "./useRoutineForm";
import { saveRoutine } from "../services/routineService";

const LOCAL_STORAGE_KEY = "routineFormState";

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
  const [attemptingNavigation, setAttemptingNavigation] = useState<string | null>(null);
  
  // Inicializar el formulario con valores desde localStorage si existen
  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  const parsedState = savedState ? JSON.parse(savedState) : null;
  
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
  } = useRoutineForm(
    initialExercises,
    parsedState?.routineName || "",
    parsedState?.routineType || ""
  );

  // Efecto para cargar los ejercicios seleccionados desde la navegación
  useEffect(() => {
    if (location.state && location.state.selectedExercises) {
      // Si ya hay ejercicios en la rutina, fusionar con los nuevos
      if (routineExercises.length > 0) {
        // Filtrar para no añadir ejercicios duplicados
        const newExercises = location.state.selectedExercises.filter(
          (newEx: any) => !routineExercises.some((ex) => ex.id === newEx.id)
        );
        
        const exercisesToAdd = newExercises.map((exercise: any) => ({
          ...exercise,
          sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
        }));
        
        setRoutineExercises([...routineExercises, ...exercisesToAdd]);
      } else {
        // Si no hay ejercicios previos, simplemente asignar los nuevos
        const exercises = location.state.selectedExercises.map((exercise: any) => ({
          ...exercise,
          sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
        }));
        
        setRoutineExercises(exercises);
      }
      
      // Limpiar el estado para evitar recargar los mismos ejercicios
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, setRoutineExercises, navigate, location.pathname, routineExercises]);
  
  // Guardar el estado del formulario en localStorage cuando cambie
  useEffect(() => {
    const stateToSave = {
      routineName,
      routineType,
      routineExercises,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [routineName, routineType, routineExercises]);

  // Advertir antes de salir de la página si hay cambios sin guardar
  useBeforeUnload((event) => {
    if (routineName || routineType || routineExercises.length > 0) {
      event.preventDefault();
      return "¿Seguro que quieres salir? Perderás los cambios no guardados.";
    }
  });
  
  const handleSelectExercises = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // No es necesario guardar el estado aquí, ya se maneja con localStorage
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

  const handleAttemptNavigation = (path: string) => {
    if (routineName || routineType || routineExercises.length > 0) {
      setAttemptingNavigation(path);
      setShowExitConfirmDialog(true);
    } else {
      navigate(path);
      clearLocalStorage();
    }
  };

  const handleConfirmExit = () => {
    if (attemptingNavigation) {
      navigate(attemptingNavigation);
      clearLocalStorage();
    }
    setShowExitConfirmDialog(false);
    setAttemptingNavigation(null);
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
      setShowSaveConfirmDialog(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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
    handleAttemptNavigation,
    handleConfirmExit
  };
};
