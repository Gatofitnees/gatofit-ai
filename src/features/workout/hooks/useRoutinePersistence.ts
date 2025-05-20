
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
        
        // Only set exercises if we don't have any from location state
        if (!location.state?.selectedExercises && exercises && exercises.length > 0) {
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

  // Load selected exercises from location state when available
  useEffect(() => {
    if (location.state && location.state.selectedExercises) {
      const exercises = location.state.selectedExercises.map((exercise: any) => ({
        ...exercise,
        sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
      }));
      
      setRoutineExercises(exercises);
    }
  }, [location.state, setRoutineExercises]);

  // Clear session storage
  const clearStoredRoutine = () => {
    sessionStorage.removeItem(STORAGE_KEY);
  };
  
  return { clearStoredRoutine };
};
