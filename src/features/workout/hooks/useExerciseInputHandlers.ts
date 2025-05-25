
import { useCallback } from "react";
import { WorkoutExercise } from "../types/workout";

export function useExerciseInputHandlers(
  allExercises: WorkoutExercise[],
  updateBaseExerciseData: (exerciseId: number, updater: (prev: WorkoutExercise) => WorkoutExercise) => void,
  temporaryExercises: WorkoutExercise[],
  addTemporaryExercises: (exercises: WorkoutExercise[]) => void,
  updateTemporaryExercise: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void,
  addTemporaryExerciseSet: (exerciseIndex: number) => void,
  baseExerciseCount: number
) {
  const handleInputChange = useCallback((exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const exercise = allExercises[exerciseIndex];
    if (!exercise) return;

    // Check if this is a temporary exercise
    const isTemporary = exerciseIndex >= baseExerciseCount;

    if (isTemporary) {
      // Use temporary exercise update function
      const tempIndex = exerciseIndex - baseExerciseCount;
      updateTemporaryExercise(tempIndex, setIndex, field, value);
    } else {
      // Use base exercise update function
      const updateExercise = (prev: WorkoutExercise) => ({
        ...prev,
        sets: prev.sets.map((set, i) => 
          i === setIndex 
            ? { ...set, [field]: value === '' ? null : parseFloat(value) }
            : set
        )
      });

      updateBaseExerciseData(exercise.id, updateExercise);
    }
  }, [allExercises, updateBaseExerciseData, updateTemporaryExercise, baseExerciseCount]);

  const handleAddSet = useCallback((exerciseIndex: number) => {
    const exercise = allExercises[exerciseIndex];
    if (!exercise) return;

    // Check if this is a temporary exercise
    const isTemporary = exerciseIndex >= baseExerciseCount;

    if (isTemporary) {
      // Use temporary exercise add set function
      const tempIndex = exerciseIndex - baseExerciseCount;
      addTemporaryExerciseSet(tempIndex);
    } else {
      // Use base exercise add set function
      const updateExercise = (prev: WorkoutExercise) => {
        const newSetNumber = prev.sets.length + 1;
        const lastSet = prev.sets[prev.sets.length - 1];
        
        const newSet = {
          set_number: newSetNumber,
          weight: null,
          reps: null,
          notes: "",
          previous_weight: null,
          previous_reps: null,
          target_reps_min: lastSet?.target_reps_min,
          target_reps_max: lastSet?.target_reps_max
        };

        return {
          ...prev,
          sets: [...prev.sets, newSet]
        };
      };

      updateBaseExerciseData(exercise.id, updateExercise);
    }
  }, [allExercises, updateBaseExerciseData, addTemporaryExerciseSet, baseExerciseCount]);

  const handleReorderDrag = useCallback((result: any) => {
    // Placeholder for reorder functionality
    console.log("Reorder drag:", result);
    return result;
  }, []);

  return {
    handleInputChange,
    handleAddSet,
    handleReorderDrag
  };
}
