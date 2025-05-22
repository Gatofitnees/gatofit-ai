
import { useEffect } from "react";
import { RoutineExercise } from "../types";

const STORAGE_KEY_PREFIX = "routine_creation";

export const useRoutinePersistence = (
  routineName?: string,
  routineType?: string,
  routineExercises?: RoutineExercise[],
  setRoutineName?: (name: string) => void,
  setRoutineType?: (type: string) => void,
  setRoutineExercises?: (exercises: RoutineExercise[]) => void,
  editRoutineId?: number
) => {
  // Load routine data from session storage on component mount
  useEffect(() => {
    // Skip loading from storage if we're in edit mode
    if (editRoutineId) return;
    
    try {
      const storedName = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}_name`);
      const storedType = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}_type`);
      const storedExercises = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}_exercises`);
      
      if (storedName && setRoutineName) {
        setRoutineName(storedName);
      }
      
      if (storedType && setRoutineType) {
        setRoutineType(storedType);
      }
      
      if (storedExercises && setRoutineExercises) {
        const parsedExercises = JSON.parse(storedExercises);
        setRoutineExercises(parsedExercises);
      }
    } catch (error) {
      console.error("Error loading routine data from session storage:", error);
    }
  }, [editRoutineId, setRoutineName, setRoutineType, setRoutineExercises]);
  
  // Save routine data to session storage whenever it changes
  useEffect(() => {
    // Skip saving to storage if we're in edit mode
    if (editRoutineId) return;
    
    try {
      if (routineName !== undefined) {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}_name`, routineName);
      }
      
      if (routineType !== undefined) {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}_type`, routineType);
      }
      
      if (routineExercises) {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}_exercises`, JSON.stringify(routineExercises));
      }
    } catch (error) {
      console.error("Error saving routine data to session storage:", error);
    }
  }, [routineName, routineType, routineExercises, editRoutineId]);
  
  // Function to clear stored routine data
  const clearStoredRoutine = () => {
    try {
      console.log("Limpiando datos de rutina en sessionStorage");
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}_name`);
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}_type`);
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}_exercises`);
    } catch (error) {
      console.error("Error clearing routine data from session storage:", error);
    }
  };

  return { clearStoredRoutine };
};
