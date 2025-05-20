import { useState, useEffect } from "react";

// Define state types for sessionStorage
export interface SelectExercisesState {
  selectedExercises: number[];
  searchTerm: string;
  muscleFilters: string[];
  equipmentFilters: string[];
}

const SESSION_STORAGE_KEY = "selectExercisesState";

export function useExerciseSelection() {
  // Initialize state from session storage or with defaults
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);
  
  // Load state from sessionStorage on component mount and reset selected exercises
  useEffect(() => {
    const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState) as SelectExercisesState;
      // Reset selected exercises but keep other filters if needed
      setSelectedExercises([]);
      setSearchTerm(parsedState.searchTerm || "");
      setMuscleFilters(parsedState.muscleFilters || []);
      setEquipmentFilters(parsedState.equipmentFilters || []);
    }
  }, []);
  
  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave: SelectExercisesState = {
      selectedExercises,
      searchTerm,
      muscleFilters,
      equipmentFilters
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [selectedExercises, searchTerm, muscleFilters, equipmentFilters]);

  const resetSessionStorage = () => {
    const resetState = {
      selectedExercises: [],
      searchTerm: "",
      muscleFilters: [],
      equipmentFilters: []
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resetState));
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedExercises,
    setSelectedExercises,
    muscleFilters,
    setMuscleFilters,
    equipmentFilters,
    setEquipmentFilters,
    resetSessionStorage
  };
}
