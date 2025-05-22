
import { useState, useEffect, useCallback } from "react";
import { RoutineExercise } from "../types";

export function useExerciseData(initialExercises: RoutineExercise[] | undefined) {
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  // Initialize exercises from initial data
  useEffect(() => {
    if (initialExercises && initialExercises.length > 0 && exercises.length === 0) {
      setExercises(initialExercises);
    }
  }, [initialExercises, exercises.length]);
  
  // Function to append new exercises to the existing ones, without duplicates
  const appendExercises = useCallback((newExercises: RoutineExercise[]) => {
    if (!newExercises || newExercises.length === 0) return;
    
    setExercises(prev => {
      // Create a Set of existing exercise IDs for quick lookup
      const existingIds = new Set(prev.map(e => e.id));
      
      // Filter out any duplicates from newExercises
      const uniqueNewExercises = newExercises.filter(e => !existingIds.has(e.id));
      
      // Combine existing and new exercises
      return [...prev, ...uniqueNewExercises];
    });
  }, []);

  // Handle input change in weight/reps fields
  const handleInputChange = useCallback((exerciseIndex: number, setIndex: number, field: string, value: string) => {
    setExercises(prevExercises => {
      const newExercises = [...prevExercises];
      const numericValue = value === '' ? 0 : parseInt(value, 10);
      
      if (!isNaN(numericValue)) {
        newExercises[exerciseIndex].sets[setIndex] = {
          ...newExercises[exerciseIndex].sets[setIndex],
          [field]: numericValue
        };
      }
      
      return newExercises;
    });
  }, []);

  // Handle exercise note changes
  const handleExerciseNotesChange = useCallback((exerciseIndex: number, notes: string) => {
    setExercises(prevExercises => {
      const newExercises = [...prevExercises];
      newExercises[exerciseIndex] = {
        ...newExercises[exerciseIndex],
        notes
      };
      return newExercises;
    });
  }, []);

  // Handle adding a set to an exercise
  const handleAddSet = useCallback((exerciseIndex: number) => {
    setExercises(prevExercises => {
      const newExercises = [...prevExercises];
      const lastSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
      
      newExercises[exerciseIndex].sets = [
        ...newExercises[exerciseIndex].sets,
        {
          reps_min: lastSet.reps_min,
          reps_max: lastSet.reps_max,
          rest_seconds: lastSet.rest_seconds
        }
      ];
      
      return newExercises;
    });
  }, []);

  // Handle reorder drag
  const handleReorderDrag = useCallback((result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    setExercises(prevExercises => {
      const newExercises = [...prevExercises];
      const [removed] = newExercises.splice(sourceIndex, 1);
      newExercises.splice(destinationIndex, 0, removed);
      return newExercises;
    });
  }, []);

  const handleToggleReorderMode = useCallback(() => {
    setIsReorderMode(prev => !prev);
  }, []);

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
    appendExercises,
    setExercises
  };
}
