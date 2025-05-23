
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
  setRoutineExercises: (exercises: RoutineExercise[]) => void,
  editRoutineId?: number
) => {
  const location = useLocation();
  const storageKey = editRoutineId ? `${STORAGE_KEY}_${editRoutineId}` : STORAGE_KEY;

  // Cargar estado desde sessionStorage al montar el componente
  useEffect(() => {
    // Si estamos editando, no cargamos del almacenamiento hasta que se carguen los datos del backend
    if (editRoutineId) {
      return;
    }
    
    const savedState = sessionStorage.getItem(storageKey);
    if (savedState) {
      try {
        const { name, type, exercises } = JSON.parse(savedState);
        
        // Solo cargamos desde almacenamiento si el estado del contexto está vacío
        if (!routineName) {
          setRoutineName(name || "");
        }
        
        if (!routineType) {
          setRoutineType(type || "");
        }
        
        if (exercises && exercises.length > 0 && routineExercises.length === 0) {
          setRoutineExercises(exercises);
        }
      } catch (error) {
        console.error("Error parsing saved routine state:", error);
        // En caso de error, limpiamos el storage para evitar errores futuros
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [setRoutineName, setRoutineType, setRoutineExercises, storageKey, editRoutineId, routineName, routineType, routineExercises.length]);

  // Guardar estado en sessionStorage cuando cambia
  useEffect(() => {
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
    if (location.state && location.state.selectedExercises) {
      const newExercises = location.state.selectedExercises;
      const shouldAddToExisting = location.state.shouldAddToExisting === true;
      
      console.log("Nuevos ejercicios recibidos:", newExercises.length);
      console.log("Debe añadirse a existentes:", shouldAddToExisting);
      
      // Crear un conjunto de IDs de ejercicios existentes para evitar duplicados
      const existingExerciseIds = new Set(routineExercises.map(ex => ex.id));
      
      // Filtrar ejercicios nuevos para evitar duplicados
      const uniqueNewExercises = newExercises.filter(
        (ex: any) => !existingExerciseIds.has(ex.id)
      );
      
      console.log("Ejercicios únicos a añadir:", uniqueNewExercises.length);
      
      if (uniqueNewExercises.length > 0) {
        // IMPORTANTE: Siempre combinamos con los ejercicios existentes
        // Este es el cambio clave - asegurarnos de que siempre combinamos con los existentes
        const updatedExercises = shouldAddToExisting 
          ? [...routineExercises, ...uniqueNewExercises]
          : uniqueNewExercises;
          
        setRoutineExercises(updatedExercises);
        console.log("Ejercicios actualizados, total:", updatedExercises.length);
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
    }
  }, [location.state, setRoutineExercises, routineExercises]);

  // Limpiar sessionStorage y resetear el formulario
  const clearStoredRoutine = () => {
    console.log("Limpiando datos de rutina en sessionStorage");
    sessionStorage.removeItem(storageKey);
  };
  
  return { clearStoredRoutine };
};
