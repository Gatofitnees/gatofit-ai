import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RoutineExercise, WorkoutBlock } from '../types';

const STORAGE_KEY = "createRoutineState";

export const useRoutinePersistence = (
  routineName: string,
  routineType: string,
  routineExercises: RoutineExercise[],
  workoutBlocks: WorkoutBlock[],
  currentBlockForExercises: string | null,
  setRoutineName: (name: string) => void,
  setRoutineType: (type: string) => void,
  setRoutineExercises: (exercises: RoutineExercise[]) => void,
  setWorkoutBlocks: (blocks: WorkoutBlock[]) => void,
  addExercisesToBlock: (blockId: string, exercises: RoutineExercise[]) => void,
  editRoutineId?: number
) => {
  const location = useLocation();
  const storageKey = editRoutineId ? `${STORAGE_KEY}_${editRoutineId}` : STORAGE_KEY;
  const hasLoadedFromStorage = useRef(false);
  const isProcessingLocationState = useRef(false);

  // Cargar estado desde sessionStorage al montar el componente (solo una vez)
  useEffect(() => {
    // Si estamos editando o ya cargamos desde storage, no cargar
    if (editRoutineId || hasLoadedFromStorage.current) {
      return;
    }
    
    const savedState = sessionStorage.getItem(storageKey);
    if (savedState) {
      try {
        const { name, type, exercises, blocks } = JSON.parse(savedState);
        
        // Solo cargamos desde almacenamiento si el estado del contexto está vacío
        if (!routineName && name) {
          setRoutineName(name);
        }
        
        if (!routineType && type) {
          setRoutineType(type);
        }
        
        if (exercises && exercises.length > 0 && routineExercises.length === 0) {
          setRoutineExercises(exercises);
        }

        // Load blocks if they exist
        if (blocks && blocks.length > 0 && workoutBlocks.length === 0) {
          setWorkoutBlocks(blocks);
        }
        
        hasLoadedFromStorage.current = true;
      } catch (error) {
        console.error("Error parsing saved routine state:", error);
        sessionStorage.removeItem(storageKey);
      }
    } else {
      hasLoadedFromStorage.current = true;
    }
  }, []);

  // Guardar estado en sessionStorage cuando cambia (solo si no estamos procesando location state)
  useEffect(() => {
    if (!hasLoadedFromStorage.current || isProcessingLocationState.current) {
      return;
    }

    // Solo guardamos si hay algo que guardar
    if (routineName || routineType || routineExercises.length > 0 || workoutBlocks.length > 0) {
      const stateToSave = {
        name: routineName,
        type: routineType,
        exercises: routineExercises,
        blocks: workoutBlocks
      };
      sessionStorage.setItem(storageKey, JSON.stringify(stateToSave));
      console.log("Estado guardado en sessionStorage:", stateToSave);
    }
  }, [routineName, routineType, routineExercises, workoutBlocks, storageKey]);

  // Manejar ejercicios desde el state de location (al regresar de select exercises)
  useEffect(() => {
    if (location.state?.selectedExercises && !isProcessingLocationState.current) {
      isProcessingLocationState.current = true;
      
      const newExercises = location.state.selectedExercises;
      const shouldAddToExisting = location.state.shouldAddToExisting !== false;
      
      console.log("Nuevos ejercicios recibidos:", newExercises.length);
      console.log("Block para ejercicios:", currentBlockForExercises);
      console.log("Debe añadirse a existentes:", shouldAddToExisting);
      console.log("Ejercicios existentes antes:", routineExercises.length);
      
      // If we have a specific block to add exercises to, use the block system
      if (currentBlockForExercises) {
        console.log("Añadiendo ejercicios al bloque:", currentBlockForExercises);
        addExercisesToBlock(currentBlockForExercises, newExercises);
      } else if (shouldAddToExisting) {
        // Legacy behavior: add to existing exercises without duplicate check
        // Since we're now allowing duplicates in blocks, we remove the duplicate filtering
        const updatedExercises = [...routineExercises, ...newExercises];
        console.log("Ejercicios actualizados (sin filtro de duplicados):", updatedExercises.length);
        setRoutineExercises(updatedExercises);
      } else {
        // Reemplazar todos los ejercicios
        setRoutineExercises(newExercises);
      }
      
      // Limpiar el estado de ubicación para evitar añadir de nuevo al navegar
      if (window.history.state) {
        window.history.replaceState(
          { 
            ...window.history.state, 
            usr: { 
              ...window.history.state.usr, 
              selectedExercises: null,
              shouldAddToExisting: null
            } 
          }, 
          ''
        );
      }
      
      // Reset flag después de un breve delay
      setTimeout(() => {
        isProcessingLocationState.current = false;
      }, 100);
    }
  }, [location.state?.selectedExercises, currentBlockForExercises, addExercisesToBlock]);

  // Limpiar sessionStorage y resetear el formulario
  const clearStoredRoutine = () => {
    console.log("Limpiando datos de rutina en sessionStorage");
    sessionStorage.removeItem(storageKey);
    hasLoadedFromStorage.current = false;
  };
  
  return { clearStoredRoutine };
};