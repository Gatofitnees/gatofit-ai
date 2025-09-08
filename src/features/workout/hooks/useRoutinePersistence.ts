
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RoutineExercise } from '../types';

const STORAGE_KEY = "createRoutineState";

export const useRoutinePersistence = (
  routineName: string,
  routineType: string,
  routineExercises: RoutineExercise[],
  setRoutineName: (name: string) => void,
  setRoutineType: (type: string) => void,
  setRoutineExercises: (exercises: RoutineExercise[]) => void,
  editRoutineId?: number,
  addExercisesToBlock?: (blockIndex: number, exercises: RoutineExercise[]) => void,
  convertBlocksToExercises?: () => RoutineExercise[]
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
        const { name, type, exercises } = JSON.parse(savedState);
        
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
    if (routineName || routineType || routineExercises.length > 0) {
      const stateToSave = {
        name: routineName,
        type: routineType,
        exercises: routineExercises
      };
      sessionStorage.setItem(storageKey, JSON.stringify(stateToSave));
      console.log("Estado guardado en sessionStorage:", stateToSave);
    }
  }, [routineName, routineType, routineExercises, storageKey]);

  // Manejar ejercicios desde el state de location (al regresar de select exercises)
  useEffect(() => {
    if (location.state?.selectedExercises && !isProcessingLocationState.current) {
      isProcessingLocationState.current = true;
      
      const newExercises = location.state.selectedExercises;
      const currentBlockIndex = location.state.currentBlockIndex;
      const shouldAddToExisting = location.state.shouldAddToExisting !== false;
      
      console.log("Nuevos ejercicios recibidos:", newExercises.length);
      console.log("Índice de bloque actual:", currentBlockIndex);
      console.log("Debe añadirse a existentes:", shouldAddToExisting);
      console.log("Ejercicios existentes antes:", routineExercises.length);
      
      // If we have a block index and the function to add exercises to blocks, use block system
      if (typeof currentBlockIndex === 'number' && addExercisesToBlock) {
        console.log("Añadiendo ejercicios al bloque:", currentBlockIndex);
        addExercisesToBlock(currentBlockIndex, newExercises);
        
        // Also update routineExercises with the current state from blocks
        if (convertBlocksToExercises) {
          const allExercises = convertBlocksToExercises();
          setRoutineExercises(allExercises);
          console.log("Ejercicios actualizados desde bloques:", allExercises.length);
        }
      } else {
        // Fallback to legacy behavior for backwards compatibility
        if (shouldAddToExisting) {
          // Crear un conjunto de IDs de ejercicios existentes para evitar duplicados
          const existingExerciseIds = new Set(routineExercises.map(ex => ex.id));
          
          // Filtrar ejercicios nuevos para evitar duplicados
          const uniqueNewExercises = newExercises.filter(
            (ex: any) => !existingExerciseIds.has(ex.id)
          );
          
          console.log("Ejercicios únicos a añadir:", uniqueNewExercises.length);
          
          if (uniqueNewExercises.length > 0) {
            const updatedExercises = [...routineExercises, ...uniqueNewExercises];
            console.log("Ejercicios actualizados después de combinar:", updatedExercises.length);
            setRoutineExercises(updatedExercises);
          }
        } else {
          // Reemplazar todos los ejercicios
          setRoutineExercises(newExercises);
        }
      }
      
      // Limpiar el estado de ubicación para evitar añadir de nuevo al navegar
      if (window.history.state) {
        window.history.replaceState(
          { 
            ...window.history.state, 
            usr: { 
              ...window.history.state.usr, 
              selectedExercises: null,
              shouldAddToExisting: null,
              currentBlockIndex: null
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
  }, [location.state?.selectedExercises, addExercisesToBlock, convertBlocksToExercises]);

  // Limpiar sessionStorage y resetear el formulario
  const clearStoredRoutine = () => {
    console.log("Limpiando datos de rutina en sessionStorage");
    sessionStorage.removeItem(storageKey);
    hasLoadedFromStorage.current = false;
  };
  
  return { clearStoredRoutine };
};
