
import { useState, useEffect } from "react";
import { WorkoutExercise } from "../types/workout";

const SESSION_STORAGE_KEY_PREFIX = "activeWorkout_";

export const useActiveWorkoutExercises = (routineId: number | undefined, baseExercises: WorkoutExercise[]) => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>(baseExercises);
  const storageKey = routineId ? `${SESSION_STORAGE_KEY_PREFIX}${routineId}` : null;

  // Cargar ejercicios temporales desde sessionStorage al iniciar
  useEffect(() => {
    if (!storageKey || !routineId) return;
    
    try {
      const savedExercises = sessionStorage.getItem(storageKey);
      if (savedExercises) {
        const parsedExercises = JSON.parse(savedExercises);
        setExercises(parsedExercises);
        console.log("Ejercicios temporales cargados:", parsedExercises.length);
      } else {
        setExercises(baseExercises);
      }
    } catch (error) {
      console.error("Error al cargar ejercicios temporales:", error);
      setExercises(baseExercises);
    }
  }, [storageKey, routineId, baseExercises]);

  // Guardar ejercicios en sessionStorage cuando cambien
  useEffect(() => {
    if (!storageKey) return;
    
    try {
      if (exercises.length > 0) {
        sessionStorage.setItem(storageKey, JSON.stringify(exercises));
        console.log("Ejercicios temporales guardados:", exercises.length);
      }
    } catch (error) {
      console.error("Error al guardar ejercicios temporales:", error);
    }
  }, [exercises, storageKey]);

  // Función para añadir ejercicios temporales
  const addTemporaryExercises = (newExercises: WorkoutExercise[]) => {
    // Crear conjunto de IDs existentes para evitar duplicados
    const existingIds = new Set(exercises.map(ex => ex.id));
    
    // Filtrar ejercicios nuevos para evitar duplicados
    const uniqueNewExercises = newExercises.filter(ex => !existingIds.has(ex.id));
    
    if (uniqueNewExercises.length > 0) {
      setExercises(prev => [...prev, ...uniqueNewExercises]);
      console.log("Ejercicios temporales añadidos:", uniqueNewExercises.length);
    }
  };

  // Función para limpiar ejercicios temporales
  const clearTemporaryExercises = () => {
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
      console.log("Ejercicios temporales eliminados");
    }
    setExercises(baseExercises);
  };

  return {
    exercises,
    setExercises,
    addTemporaryExercises,
    clearTemporaryExercises
  };
};
