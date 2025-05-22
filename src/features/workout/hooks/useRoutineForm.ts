
import { useState, useCallback } from "react";
import { RoutineExercise } from "../types";

interface ValidationErrors {
  name: boolean;
  type: boolean;
}

export function useRoutineForm(
  routineExercises: RoutineExercise[],
  routineName: string,
  routineType: string,
  setRoutineExercises: (exercises: RoutineExercise[]) => void
) {
  // Track validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    name: false,
    type: false,
  });

  // Update validation errors when inputs change
  const updateValidationErrors = useCallback(() => {
    setValidationErrors({
      name: !routineName,
      type: !routineType
    });
    
    // Retorna true si todos los campos son válidos
    return !(!routineName || !routineType);
  }, [routineName, routineType]);

  // Add a set to an exercise
  const handleAddSet = useCallback((exerciseIndex: number) => {
    const updatedExercises = [...routineExercises];
    const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    
    updatedExercises[exerciseIndex].sets.push({
      reps_min: lastSet.reps_min,
      reps_max: lastSet.reps_max,
      rest_seconds: lastSet.rest_seconds
    });
    
    setRoutineExercises(updatedExercises);
  }, [routineExercises, setRoutineExercises]);

  // Update a specific set value
  const handleSetUpdate = useCallback((exerciseIndex: number, setIndex: number, field: string, value: number) => {
    const updatedExercises = [...routineExercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setRoutineExercises(updatedExercises);
  }, [routineExercises, setRoutineExercises]);

  // Remove an exercise
  const handleRemoveExercise = useCallback((index: number) => {
    const updatedExercises = [...routineExercises];
    updatedExercises.splice(index, 1);
    setRoutineExercises(updatedExercises);
  }, [routineExercises, setRoutineExercises]);

  // Move an exercise to a different position
  const handleMoveExercise = useCallback((fromIndex: number, toIndex: number) => {
    const updatedExercises = [...routineExercises];
    const [movedExercise] = updatedExercises.splice(fromIndex, 1);
    updatedExercises.splice(toIndex, 0, movedExercise);
    setRoutineExercises(updatedExercises);
  }, [routineExercises, setRoutineExercises]);

  return {
    validationErrors,
    updateValidationErrors,
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise
  };
}
