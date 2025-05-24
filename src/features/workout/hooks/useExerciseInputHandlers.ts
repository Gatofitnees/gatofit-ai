import { useCallback } from "react";
import { WorkoutExercise } from "../types/workout";

export function useExerciseInputHandlers(
  allExercises: WorkoutExercise[],
  updateBaseExerciseData: (exerciseId: number, updater: (prev: WorkoutExercise) => WorkoutExercise) => void,
  temporaryExercises: WorkoutExercise[],
  addTemporaryExercises: (exercises: WorkoutExercise[]) => void
) {
  const handleInputChange = useCallback((exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const exercise = allExercises[exerciseIndex];
    if (!exercise) return;

    const updateExercise = (prev: WorkoutExercise) => ({
      ...prev,
      sets: prev.sets.map((set, i) => 
        i === setIndex 
          ? { ...set, [field]: value === '' ? null : parseFloat(value) }
          : set
      )
    });

    updateBaseExerciseData(exercise.id, updateExercise);
  }, [allExercises, updateBaseExerciseData]);

  const handleAddSet = useCallback((exerciseIndex: number) => {
    const exercise = allExercises[exerciseIndex];
    if (!exercise) return;

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
  }, [allExercises, updateBaseExerciseData]);

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
