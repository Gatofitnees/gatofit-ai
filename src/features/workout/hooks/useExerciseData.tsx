
import { useState, useEffect, useCallback } from "react";
import { RoutineExercise } from "../types";
import { WorkoutExercise, WorkoutSet } from "../types/workout";

export function useExerciseData(initialExercises: WorkoutExercise[] | undefined) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showStatsDialog, setShowStatsDialog] = useState<number | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  // Initialize exercises from initial data
  useEffect(() => {
    if (initialExercises && initialExercises.length > 0 && exercises.length === 0) {
      setExercises(initialExercises);
    }
  }, [initialExercises, exercises.length]);
  
  // Function to append new exercises to the existing ones, without duplicates
  const appendExercises = useCallback((newExercises: RoutineExercise[] | WorkoutExercise[]) => {
    if (!newExercises || newExercises.length === 0) return;
    
    setExercises(prev => {
      // Create a Set of existing exercise IDs for quick lookup
      const existingIds = new Set(prev.map(e => e.id));
      
      // Convert and filter out any duplicates from newExercises
      const convertedExercises = newExercises.map(e => {
        // Check if it's already a WorkoutExercise or needs conversion
        if ('notes' in e) {
          return e as WorkoutExercise;
        } else {
          // Convert RoutineExercise to WorkoutExercise
          const routineEx = e as RoutineExercise;
          const workoutSets: WorkoutSet[] = routineEx.sets.map((set, idx) => ({
            set_number: idx + 1,
            weight: null,
            reps: null,
            notes: "",
            previous_weight: null,
            previous_reps: null
          }));
          
          return {
            id: routineEx.id,
            name: routineEx.name,
            muscle_group_main: routineEx.muscle_group_main || "",
            equipment_required: routineEx.equipment_required,
            notes: "",
            sets: workoutSets
          };
        }
      });
      
      // Filter out duplicates
      const uniqueNewExercises = convertedExercises.filter(e => !existingIds.has(e.id)) as WorkoutExercise[];
      
      // Combine existing and new exercises
      return [...prev, ...uniqueNewExercises];
    });
  }, []);

  // Handle input change in weight/reps fields
  const handleInputChange = useCallback((exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setExercises(prevExercises => {
      const newExercises = [...prevExercises];
      const numericValue = value === '' ? null : Number(value);
      
      if (newExercises[exerciseIndex] && newExercises[exerciseIndex].sets[setIndex]) {
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
      if (newExercises[exerciseIndex]) {
        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          notes
        };
      }
      return newExercises;
    });
  }, []);

  // Handle adding a set to an exercise
  const handleAddSet = useCallback((exerciseIndex: number) => {
    setExercises(prevExercises => {
      const newExercises = [...prevExercises];
      if (!newExercises[exerciseIndex]) return prevExercises;
      
      const lastSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
      const newSetNumber = newExercises[exerciseIndex].sets.length + 1;
      
      newExercises[exerciseIndex].sets = [
        ...newExercises[exerciseIndex].sets,
        {
          set_number: newSetNumber,
          weight: lastSet?.weight || null,
          reps: lastSet?.reps || null,
          notes: "",
          previous_weight: null,
          previous_reps: null
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
