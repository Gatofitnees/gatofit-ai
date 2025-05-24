
import { useState, useEffect, useCallback } from "react";
import { WorkoutExercise } from "../types/workout";

interface TemporaryExercise {
  id: number;
  name: string;
  muscle_group_main?: string;
  equipment_required?: string;
  sets: Array<{
    set_number: number;
    weight: number | null;
    reps: number | null;
    notes: string;
    previous_weight: number | null;
    previous_reps: number | null;
  }>;
  notes: string;
}

export const useTemporaryExercises = (routineId: number | undefined) => {
  const [temporaryExercises, setTemporaryExercises] = useState<TemporaryExercise[]>([]);
  
  const getStorageKey = (id: number) => `temp_exercises_${id}`;
  
  // Load temporary exercises from sessionStorage on mount
  useEffect(() => {
    if (!routineId) return;
    
    const storageKey = getStorageKey(routineId);
    const stored = sessionStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTemporaryExercises(parsed);
        console.log("Loaded temporary exercises from storage:", parsed.length);
      } catch (error) {
        console.error("Error parsing temporary exercises:", error);
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [routineId]);
  
  // Save to sessionStorage whenever temporaryExercises changes
  useEffect(() => {
    if (!routineId) return;
    
    const storageKey = getStorageKey(routineId);
    
    if (temporaryExercises.length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(temporaryExercises));
      console.log("Saved temporary exercises to storage:", temporaryExercises.length);
    } else {
      sessionStorage.removeItem(storageKey);
    }
  }, [temporaryExercises, routineId]);
  
  const addTemporaryExercises = useCallback((exercises: any[]) => {
    const formattedExercises: TemporaryExercise[] = exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      muscle_group_main: exercise.muscle_group_main,
      equipment_required: exercise.equipment_required,
      sets: exercise.sets || [
        {
          set_number: 1,
          weight: null,
          reps: null,
          notes: "",
          previous_weight: null,
          previous_reps: null
        }
      ],
      notes: ""
    }));
    
    setTemporaryExercises(prev => {
      // Prevent duplicates by checking if exercise already exists
      const existingIds = prev.map(ex => ex.id);
      const newExercises = formattedExercises.filter(ex => !existingIds.includes(ex.id));
      
      if (newExercises.length === 0) {
        console.log("No new exercises to add (duplicates filtered)");
        return prev;
      }
      
      console.log("Adding temporary exercises:", newExercises.length);
      return [...prev, ...newExercises];
    });
  }, []);
  
  const clearTemporaryExercises = useCallback(() => {
    if (!routineId) return;
    
    const storageKey = getStorageKey(routineId);
    sessionStorage.removeItem(storageKey);
    setTemporaryExercises([]);
    console.log("Cleared temporary exercises");
  }, [routineId]);
  
  const updateTemporaryExercise = useCallback((
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    const numValue = value === '' ? null : Number(value);
    
    setTemporaryExercises(prev => {
      const updated = [...prev];
      if (updated[exerciseIndex] && updated[exerciseIndex].sets[setIndex]) {
        updated[exerciseIndex].sets[setIndex][field] = numValue;
      }
      return updated;
    });
  }, []);
  
  const updateTemporaryExerciseNotes = useCallback((exerciseIndex: number, notes: string) => {
    setTemporaryExercises(prev => {
      const updated = [...prev];
      if (updated[exerciseIndex]) {
        updated[exerciseIndex].notes = notes;
      }
      return updated;
    });
  }, []);
  
  const addTemporaryExerciseSet = useCallback((exerciseIndex: number) => {
    setTemporaryExercises(prev => {
      const updated = [...prev];
      if (updated[exerciseIndex]) {
        const exercise = updated[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];
        
        exercise.sets.push({
          set_number: exercise.sets.length + 1,
          weight: lastSet?.weight || null,
          reps: lastSet?.reps || null,
          notes: "",
          previous_weight: null,
          previous_reps: null
        });
      }
      return updated;
    });
  }, []);
  
  return {
    temporaryExercises,
    addTemporaryExercises,
    clearTemporaryExercises,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet
  };
};
