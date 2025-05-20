
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RoutineExercise } from '../types';

const STORAGE_KEY = "createRoutineState";

export const useRoutinePersistence = (
  routineName: string,
  routineType: string,
  routineExercises: RoutineExercise[],
  setRoutineName: (name: string) => void,
  setRoutineType: (type: string) => void,
  setRoutineExercises: (exercises: RoutineExercise[]) => void
) => {
  const location = useLocation();

  // Load state from sessionStorage on component mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { name, type, exercises } = JSON.parse(savedState);
        setRoutineName(name || "");
        setRoutineType(type || "");
        
        if (exercises && exercises.length > 0) {
          // Keep the existing exercises and add any from location state
          setRoutineExercises(exercises);
        }
      } catch (error) {
        console.error("Error parsing saved routine state:", error);
      }
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      name: routineName,
      type: routineType,
      exercises: routineExercises
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [routineName, routineType, routineExercises]);

  // Handle exercises from location state (when returning from select exercises)
  useEffect(() => {
    if (location.state && location.state.selectedExercises) {
      const newExercises = location.state.selectedExercises.map((exercise: any) => ({
        ...exercise,
        sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
      }));
      
      // Merge new exercises with existing ones
      // Fix: Use intermediate variable to handle the update function pattern
      const updatedExercises = [...routineExercises];
      
      // Create a map of existing exercise IDs to avoid duplicates
      const existingExerciseIds = new Set(updatedExercises.map(ex => ex.id));
      
      // Filter out any new exercises that already exist
      const uniqueNewExercises = newExercises.filter(
        ex => !existingExerciseIds.has(ex.id)
      );
      
      // Set the exercises using the array directly, not a function
      setRoutineExercises([...updatedExercises, ...uniqueNewExercises]);
      
      // Clear the location state to prevent re-adding on navigation
      if (window.history.state) {
        const newState = { ...window.history.state };
        if (newState.usr && newState.usr.selectedExercises) {
          delete newState.usr.selectedExercises;
          window.history.replaceState(newState, '');
        }
      }
    }
  }, [location.state, routineExercises, setRoutineExercises]);

  // Clear session storage
  const clearStoredRoutine = () => {
    sessionStorage.removeItem(STORAGE_KEY);
  };
  
  return { clearStoredRoutine };
};
