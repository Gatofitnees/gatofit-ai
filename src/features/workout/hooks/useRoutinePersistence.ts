
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RoutineExercise } from "../types";
import { useRoutineForm } from "./useRoutineForm";

const LOCAL_STORAGE_KEY = "routineFormState";

export function useRoutinePersistence(initialExercises: RoutineExercise[] = []) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize form with values from localStorage if they exist
  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  const parsedState = savedState ? JSON.parse(savedState) : null;
  
  const {
    routineName,
    setRoutineName,
    routineType,
    setRoutineType,
    routineExercises,
    setRoutineExercises,
    validationErrors,
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    validateForm
  } = useRoutineForm(
    initialExercises,
    parsedState?.routineName || "",
    parsedState?.routineType || ""
  );

  // Effect to load selected exercises from navigation
  useEffect(() => {
    if (location.state && location.state.selectedExercises) {
      // If there are already exercises in the routine, merge with new ones
      if (routineExercises.length > 0) {
        // Filter to avoid adding duplicate exercises
        const newExercises = location.state.selectedExercises.filter(
          (newEx: any) => !routineExercises.some((ex) => ex.id === newEx.id)
        );
        
        const exercisesToAdd = newExercises.map((exercise: any) => ({
          ...exercise,
          sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
        }));
        
        setRoutineExercises([...routineExercises, ...exercisesToAdd]);
      } else {
        // If no previous exercises, simply assign the new ones
        const exercises = location.state.selectedExercises.map((exercise: any) => ({
          ...exercise,
          sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
        }));
        
        setRoutineExercises(exercises);
      }
      
      // Clear the state to prevent reloading the same exercises
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, setRoutineExercises, navigate, location.pathname, routineExercises]);
  
  // Save form state to localStorage when it changes
  useEffect(() => {
    const stateToSave = {
      routineName,
      routineType,
      routineExercises,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [routineName, routineType, routineExercises]);

  const clearLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleSelectExercises = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    navigate("/workout/select-exercises");
  };

  return {
    // Form state
    routineName,
    setRoutineName,
    routineType,
    setRoutineType,
    routineExercises,
    setRoutineExercises,
    validationErrors,
    
    // Form handlers
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    validateForm,
    
    // Navigation & persistence
    handleSelectExercises,
    clearLocalStorage
  };
}
