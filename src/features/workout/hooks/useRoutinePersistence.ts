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
  }, [setRoutineName, setRoutineType, setRoutineExercises]);

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
      
      // Crear una copia de los ejercicios actuales
      const updatedExercises = [...routineExercises];
      
      // Crear un conjunto de IDs de ejercicios existentes para evitar duplicados
      const existingExerciseIds = new Set(updatedExercises.map(ex => ex.id));
      
      // Filtrar ejercicios nuevos para evitar duplicados
      const uniqueNewExercises = newExercises.filter(
        ex => !existingExerciseIds.has(ex.id)
      );
      
      // Actualizar los ejercicios con el array completo, no con una función
      setRoutineExercises([...updatedExercises, ...uniqueNewExercises]);
      
      // Limpiar el estado de ubicación para evitar añadir de nuevo al navegar
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
