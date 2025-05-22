import { useState, useEffect } from "react";
import { SelectExercisesState, SESSION_STORAGE_KEY } from "./types";
import { useLocation } from "react-router-dom";

export const useSelectionStorage = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);
  const [previouslySelectedIds, setPreviouslySelectedIds] = useState<number[]>([]);

  // Initialize from session storage or with defaults
  useEffect(() => {
    // Check if there are already selected exercises in the location state
    if (location.state && location.state.currentExercises) {
      // Extract the IDs of already selected exercises
      const existingIds = location.state.currentExercises.map((ex: any) => ex.id);
      setPreviouslySelectedIds(existingIds);
      console.log("Previously selected exercise IDs set from state:", existingIds);
    }
    
    const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as SelectExercisesState;
        // Recover filters and search term, but don't load selected exercises
        // to avoid issues with multiple selection sessions
        setSearchTerm(parsedState.searchTerm || "");
        setMuscleFilters(parsedState.muscleFilters || []);
        setEquipmentFilters(parsedState.equipmentFilters || []);
        
        // We don't restore the selected exercises to avoid confusion between sessions
        // setSelectedExercises(parsedState.selectedExercises || []);
      } catch (error) {
        console.error("Error parsing exercise selection state:", error);
      }
    }
  }, [location.state]);

  // Save filtering state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave: SelectExercisesState = {
      selectedExercises,
      searchTerm,
      muscleFilters,
      equipmentFilters,
      previouslySelectedIds
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [selectedExercises, searchTerm, muscleFilters, equipmentFilters, previouslySelectedIds]);

  // Reset only selected exercises in session storage
  const resetSessionStorage = () => {
    const currentState = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || "{}");
    // Keep filters but reset selected exercises
    const resetState = {
      ...currentState,
      selectedExercises: []
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
    previouslySelectedIds,
    setPreviouslySelectedIds,
    resetSessionStorage
  };
};
