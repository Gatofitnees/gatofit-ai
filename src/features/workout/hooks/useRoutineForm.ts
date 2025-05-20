
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoutineExercise } from "../types";

interface RoutineFormState {
  routineName: string;
  routineType: string;
  routineExercises: RoutineExercise[];
}

interface ValidationErrors {
  name: boolean;
  type: boolean;
}

export function useRoutineForm(initialExercises: RoutineExercise[] = []) {
  const { toast } = useToast();
  const [routineName, setRoutineName] = useState("");
  const [routineType, setRoutineType] = useState("");
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>(initialExercises);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    name: false,
    type: false,
  });

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...routineExercises];
    const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    
    updatedExercises[exerciseIndex].sets.push({
      reps_min: lastSet.reps_min,
      reps_max: lastSet.reps_max,
      rest_seconds: lastSet.rest_seconds
    });
    
    setRoutineExercises(updatedExercises);
  };

  const handleSetUpdate = (exerciseIndex: number, setIndex: number, field: string, value: number) => {
    const updatedExercises = [...routineExercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setRoutineExercises(updatedExercises);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...routineExercises];
    updatedExercises.splice(index, 1);
    setRoutineExercises(updatedExercises);
  };

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    const updatedExercises = [...routineExercises];
    const [movedExercise] = updatedExercises.splice(fromIndex, 1);
    updatedExercises.splice(toIndex, 0, movedExercise);
    setRoutineExercises(updatedExercises);
  };

  const validateForm = () => {
    const errors = {
      name: !routineName,
      type: !routineType
    };
    
    setValidationErrors(errors);
    
    if (errors.name) {
      toast({
        title: "Error",
        description: "Escribe un nombre a la rutina",
        variant: "destructive"
      });
      return false;
    }
    
    if (errors.type) {
      toast({
        title: "Error",
        description: "Selecciona el tipo de rutina",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  return {
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
  };
}
