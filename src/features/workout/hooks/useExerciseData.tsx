import { useState, useEffect } from "react";
import { WorkoutExercise } from "../types/workout";
import { useTemporaryExercises } from "./useTemporaryExercises";
import { usePreviousData } from "./usePreviousData";
import { useBaseExerciseData } from "./useBaseExerciseData";
import { useExerciseInputHandlers } from "./useExerciseInputHandlers";
import { useExerciseUIState } from "./useExerciseUIState";

export function useExerciseData(exerciseDetails: any[], routineId?: number) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  const {
    temporaryExercises,
    addTemporaryExercises,
    clearTemporaryExercises,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet
  } = useTemporaryExercises(routineId);

  const {
    previousData,
    exerciseNotesMap,
    previousDataLoaded
  } = usePreviousData(exerciseDetails);

  const {
    baseExerciseData,
    updateBaseExerciseData,
    isInitialized
  } = useBaseExerciseData({
    exerciseDetails,
    previousData,
    exerciseNotesMap,
    previousDataLoaded
  });

  const {
    showStatsDialog,
    isReorderMode,
    setShowStatsDialog,
    handleToggleReorderMode
  } = useExerciseUIState();

  // Combine base exercises with temporary exercises
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log("Combining exercises - baseExerciseData keys:", Object.keys(baseExerciseData));
    console.log("Temporary exercises count:", temporaryExercises.length);
    
    // Use the preserved data from baseExerciseData
    const baseExercisesArray = exerciseDetails.map(ex => {
      const preservedData = baseExerciseData[ex.id];
      if (preservedData) {
        console.log(`Using preserved data for exercise ${ex.id}:`, preservedData.sets.map(s => ({ weight: s.weight, reps: s.reps })));
        return preservedData;
      }
      
      // This shouldn't happen now, but keeping as fallback
      console.warn(`Fallback creation for exercise ${ex.id}`);
      return {
        id: ex.id,
        name: ex.name,
        sets: [],
        muscle_group_main: ex.muscle_group_main,
        equipment_required: ex.equipment_required,
        notes: ""
      };
    });

    // Combine base exercises with temporary exercises
    const allExercises = [...baseExercisesArray, ...temporaryExercises];
    setExercises(allExercises);
    
    console.log("Combined exercises:", {
      baseCount: baseExercisesArray.length,
      tempCount: temporaryExercises.length,
      totalCount: allExercises.length,
      baseExercisesData: baseExercisesArray.map(ex => ({ 
        id: ex.id, 
        name: ex.name, 
        setsWithData: ex.sets.filter(s => s.weight !== null || s.reps !== null).length 
      }))
    });
  }, [baseExerciseData, temporaryExercises, exerciseDetails, isInitialized]);

  const {
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet
  } = useExerciseInputHandlers({
    exercises,
    exerciseDetails,
    updateBaseExerciseData,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet
  });

  const handleReorderDrag = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setExercises(items);
  };

  return {
    exercises,
    showStatsDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleReorderDrag,
    setShowStatsDialog,
    handleToggleReorderMode,
    addTemporaryExercises,
    clearTemporaryExercises
  };
}
