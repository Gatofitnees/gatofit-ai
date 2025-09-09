
import { useCallback, useState } from "react";
import React from "react";
import { useRoutineContext } from "../contexts/RoutineContext";
import { useRoutinePersistence } from "./useRoutinePersistence";
import { useRoutineNavigation } from "./navigation";
import { useRoutineSheets } from "./useRoutineSheets";
import { useRoutineSave } from "./useRoutineSave";
import { useRoutineForm } from "./useRoutineForm";
import { useWorkoutBlocks } from "./useWorkoutBlocks";
import { RoutineExercise } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { convertRoutineTypeToUi } from "../utils/routineTypeMapping";

export const useCreateRoutine = (initialExercises: RoutineExercise[] = [], editRoutineId?: number) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get context state and setters
  const { 
    routineName,
    routineType,
    routineExercises,
    workoutBlocks,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    showBlockTypeSelector,
    currentExerciseIndex,
    currentBlockIndex,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setWorkoutBlocks,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    setShowBlockTypeSelector,
    setCurrentExerciseIndex,
    setCurrentBlockIndex,
  } = useRoutineContext();

  // Initialize workout blocks system
  const {
    blocks,
    setBlocks,
    showBlockTypeSelector: blocksShowSelector,
    setShowBlockTypeSelector: blocksSetShowSelector,
    createBlock,
    addExercisesToBlock,
    addSetToExercise,
    updateExerciseSet,
    removeExerciseFromBlock,
    moveExerciseInBlock,
    convertBlocksToExercises,
    convertExercisesToBlocks,
    resetBlocks,
  } = useWorkoutBlocks();

  // Sync blocks with context and routineExercises
  React.useEffect(() => {
    setWorkoutBlocks(blocks);
    // Also sync the flattened exercise list
    const flatExercises = convertBlocksToExercises();
    setRoutineExercises(flatExercises);
  }, [blocks, setWorkoutBlocks, convertBlocksToExercises, setRoutineExercises]);

  // Initialize form handling (for legacy support)
  const {
    validationErrors,
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
  } = useRoutineForm(
    routineExercises, 
    routineName, 
    routineType, 
    setRoutineExercises
  );
  
  // Set up persistence
  useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    editRoutineId,
    addExercisesToBlock,
    convertBlocksToExercises
  );
  
  // Set up navigation handlers
  const { 
    handleNavigateAway,
    handleBackClick,
    handleSelectExercises,
    handleDiscardChanges 
  } = useRoutineNavigation(editRoutineId);
  
  // Set up sheet handlers
  const { 
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave 
  } = useRoutineSheets();
  
  // Set up save handlers
  const { 
    handleSaveRoutineStart,
    handleSaveRoutine 
  } = useRoutineSave(editRoutineId);

  // Block-specific handlers
  const handleAddBlock = useCallback(() => {
    setShowBlockTypeSelector(true);
  }, [setShowBlockTypeSelector]);

  const handleBlockTypeSelect = useCallback((type: any) => {
    createBlock(type);
    setShowBlockTypeSelector(false);
  }, [createBlock, setShowBlockTypeSelector]);

  const handleBlockTypeSelectorClose = useCallback(() => {
    setShowBlockTypeSelector(false);
  }, [setShowBlockTypeSelector]);

  const handleAddExercisesToBlock = useCallback((blockIndex: number) => {
    setCurrentBlockIndex(blockIndex);
    handleSelectExercises(undefined, blockIndex);
  }, [setCurrentBlockIndex, handleSelectExercises]);

  const handleAddSetToBlock = useCallback((blockIndex: number, exerciseIndex: number) => {
    addSetToExercise(blockIndex, exerciseIndex);
  }, [addSetToExercise]);

  const handleSetUpdateInBlock = useCallback((
    blockIndex: number, 
    exerciseIndex: number, 
    setIndex: number, 
    field: string, 
    value: number
  ) => {
    updateExerciseSet(blockIndex, exerciseIndex, setIndex, field, value);
  }, [updateExerciseSet]);

  const handleExerciseOptionsInBlock = useCallback((blockIndex: number, exerciseIndex: number) => {
    setCurrentBlockIndex(blockIndex);
    setCurrentExerciseIndex(exerciseIndex);
    setShowExerciseOptionsSheet(true);
  }, [setCurrentBlockIndex, setCurrentExerciseIndex, setShowExerciseOptionsSheet]);

  const handleReorderClickInBlock = useCallback((blockIndex: number) => {
    setCurrentBlockIndex(blockIndex);
    setShowReorderSheet(true);
  }, [setCurrentBlockIndex, setShowReorderSheet]);

  // Función para cargar los datos de la rutina a editar
  const loadRoutineData = useCallback(async (routineId: number) => {
    setIsLoading(true);
    try {
      // Obtener datos de la rutina
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single();

      if (routineError || !routineData) {
        throw routineError || new Error("No se encontró la rutina");
      }

      // Establecer nombre y tipo (convertir de DB a UI)
      setRoutineName(routineData.name);
      setRoutineType(convertRoutineTypeToUi(routineData.type) || "general");

      // Obtener ejercicios de la rutina
      const { data: routineExercisesData, error: exercisesError } = await supabase
        .from('routine_exercises')
        .select(`
          *,
          exercise:exercise_id(*)
        `)
        .eq('routine_id', routineId)
        .order('exercise_order', { ascending: true });

      if (exercisesError) {
        throw exercisesError;
      }

      if (routineExercisesData && routineExercisesData.length > 0) {
        // Formatear datos de ejercicios
        const formattedExercises = routineExercisesData.map(item => {
          const exerciseData = item.exercise as any;
          return {
            id: exerciseData.id,
            name: exerciseData.name,
            muscle_group_main: exerciseData.muscle_group_main,
            equipment_required: exerciseData.equipment_required,
            sets: Array(item.sets || 1).fill({}).map((_, idx) => ({
              set_number: idx + 1,
              reps_min: item.reps_min || 0,
              reps_max: item.reps_max || 0,
              rest_seconds: item.rest_between_sets_seconds || 60
            })),
            notes: ""
          };
        });

        // Convert exercises to blocks format for the block system
        if (formattedExercises && formattedExercises.length > 0) {
          convertExercisesToBlocks(formattedExercises);
          setRoutineExercises(formattedExercises);
        }
      }

      console.log("Rutina cargada para edición:", routineData.name);
    } catch (error: any) {
      console.error("Error al cargar la rutina:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la rutina para editar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [setRoutineName, setRoutineType, setRoutineExercises, toast]);

  return {
    // State
    routineName,
    routineType,
    routineExercises,
    workoutBlocks,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    showBlockTypeSelector,
    currentExerciseIndex,
    currentBlockIndex,
    isLoading,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    
    // Legacy handlers (for backward compatibility)
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    handleSelectExercises,
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave,
    
    // Block handlers
    handleAddBlock,
    handleBlockTypeSelect,
    handleBlockTypeSelectorClose,
    handleAddExercisesToBlock,
    handleAddSetToBlock,
    handleSetUpdateInBlock,
    handleExerciseOptionsInBlock,
    handleReorderClickInBlock,
    
    // Save handlers
    handleSaveRoutineStart,
    handleSaveRoutine,
    handleDiscardChanges,
    handleNavigateAway,
    handleBackClick,
    
    // Carga de datos para edición
    loadRoutineData
  };
};
