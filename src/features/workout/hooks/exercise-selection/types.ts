
import { ExerciseItem } from "../../types";

// Define state types for sessionStorage
export interface SelectExercisesState {
  selectedExercises: number[];
  searchTerm: string;
  muscleFilters: string[];
  equipmentFilters: string[];
  previouslySelectedIds?: number[]; // Track previously selected exercises
}

export const SESSION_STORAGE_KEY = "selectExercisesState";

export interface ExerciseSelectionFilters {
  searchTerm: string;
  muscleFilters: string[];
  equipmentFilters: string[];
}
