
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RoutineExercise } from "../types";
import { useRoutineContext } from "../contexts/RoutineContext";
import { useRoutineForm } from "./useRoutineForm";
import { useRoutineSheets } from "./useRoutineSheets";
import { useRoutineNavigation } from "./useRoutineNavigation";
import { useRoutineSave } from "./useRoutineSave";
import { useRoutinePersistence } from "./useRoutinePersistence";
import { supabase } from "@/integrations/supabase/client";

export const useCreateRoutine = (initialExercises: RoutineExercise[] = [], editRoutineId?: number) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Get all context variables
  const {
    routineName,
    routineType,
    routineExercises,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setIsSubmitting,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    setCurrentExerciseIndex
  } = useRoutineContext();
  
  // Get form helpers
  const {
    validationErrors,
    updateValidationErrors,
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise
  } = useRoutineForm(routineExercises, routineName, routineType, setRoutineExercises);
  
  // Get sheet helpers - Fix the error by passing only the required parameters
  const {
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave
  } = useRoutineSheets(
    setShowExerciseOptionsSheet, 
    setShowReorderSheet, 
    setCurrentExerciseIndex
  );
  
  // Get navigation helpers
  const {
    handleNavigateAway,
    handleBackClick,
    handleSelectExercises,
    handleDiscardChanges
  } = useRoutineNavigation(editRoutineId);
  
  // Get save helpers
  const {
    handleSaveRoutineStart,
    handleSaveRoutine
  } = useRoutineSave(editRoutineId);
  
  // Get persistence helper
  const { clearStoredRoutine } = useRoutinePersistence();
  
  // Load routine data if in edit mode
  const loadRoutineData = useCallback(async (routineId: number) => {
    setIsLoading(true);
    try {
      // Fetch routine details
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single();
        
      if (routineError) {
        throw routineError;
      }
      
      if (!routineData) {
        throw new Error(`No routine found with ID ${routineId}`);
      }
      
      // Update routine details in state
      setRoutineName(routineData.name);
      setRoutineType(routineData.type || '');
      
      // Fetch routine exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('routine_exercises')
        .select(`
          *,
          exercise:exercise_id (
            id,
            name,
            muscle_group_main,
            equipment_required,
            video_url
          )
        `)
        .eq('routine_id', routineId)
        .order('exercise_order', { ascending: true });
        
      if (exercisesError) {
        throw exercisesError;
      }
      
      if (exercisesData && exercisesData.length > 0) {
        // Transform data to match RoutineExercise format
        const formattedExercises: RoutineExercise[] = [];
        
        // Group exercises by exercise_id and collect sets
        const exerciseMap = new Map();
        
        exercisesData.forEach(item => {
          const exerciseId = item.exercise_id;
          
          if (!exerciseMap.has(exerciseId)) {
            // Create new exercise entry
            exerciseMap.set(exerciseId, {
              id: item.exercise.id,
              name: item.exercise.name,
              muscle_group_main: item.exercise.muscle_group_main,
              equipment_required: item.exercise.equipment_required,
              video_url: item.exercise.video_url,
              sets: []
            });
          }
          
          // Add set to the exercise
          exerciseMap.get(exerciseId).sets.push({
            reps_min: item.reps_min,
            reps_max: item.reps_max,
            rest_seconds: item.rest_between_sets_seconds
          });
        });
        
        // Convert map to array
        exerciseMap.forEach(exercise => {
          formattedExercises.push(exercise);
        });
        
        setRoutineExercises(formattedExercises);
      }
      
    } catch (error: any) {
      console.error("Error loading routine data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar los datos de la rutina",
        variant: "destructive"
      });
      navigate("/workout");
    } finally {
      setIsLoading(false);
    }
  }, [setRoutineName, setRoutineType, setRoutineExercises, toast, navigate]);

  return {
    // State
    routineName,
    routineType,
    routineExercises,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
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
    handleDiscardChanges,
    handleBackClick,
    updateValidationErrors,
    
    // Loading/Editing state
    loadRoutineData,
    isLoading
  };
};
