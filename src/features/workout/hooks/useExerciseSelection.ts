
import { useExercises } from "@/hooks/useExercises";
import { useSelectionStorage } from "./exercise-selection/useSelectionStorage";
import { useExerciseFilters } from "./exercise-selection/useExerciseFilters";
import { useExerciseNavigation } from "./exercise-selection/useExerciseNavigation";
import { useLocation } from "react-router-dom";

export const useExerciseSelection = () => {
  const location = useLocation();
  const { exercises, loading, muscleGroups, equipmentTypes } = useExercises();
  
  const {
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
  } = useSelectionStorage();

  const { filteredExercises, handleMuscleFilterToggle, handleEquipmentFilterToggle } = 
    useExerciseFilters(exercises, { searchTerm, muscleFilters, equipmentFilters });

  const { 
    handleExerciseDetails, 
    handleNavigateBack: baseHandleNavigateBack, 
    handleCreateExercise,
    handleAddExercises: baseHandleAddExercises,
    isActiveWorkout
  } = useExerciseNavigation();

  const handleExerciseSelect = (id: number) => {
    if (selectedExercises.includes(id)) {
      setSelectedExercises(selectedExercises.filter(exId => exId !== id));
    } else {
      setSelectedExercises([...selectedExercises, id]);
    }
  };

  const handleMuscleFilterToggleWrapper = (muscle: string) => {
    handleMuscleFilterToggle(muscle, setMuscleFilters);
  };

  const handleEquipmentFilterToggleWrapper = (equipment: string) => {
    handleEquipmentFilterToggle(equipment, setEquipmentFilters);
  };

  const handleNavigateBack = () => {
    baseHandleNavigateBack(resetSessionStorage);
  };

  const handleAddExercises = () => {
    // Detectar si estamos en un entrenamiento activo o no
    baseHandleAddExercises(selectedExercises, exercises, resetSessionStorage);
  };

  return {
    filteredExercises,
    selectedExercises,
    muscleGroups,
    equipmentTypes,
    muscleFilters,
    equipmentFilters,
    searchTerm,
    loading,
    previouslySelectedIds,
    isActiveWorkout: isActiveWorkout(),
    setSearchTerm,
    setPreviouslySelectedIds,
    handleExerciseSelect,
    handleMuscleFilterToggle: handleMuscleFilterToggleWrapper,
    handleEquipmentFilterToggle: handleEquipmentFilterToggleWrapper,
    handleExerciseDetails,
    handleNavigateBack,
    handleCreateExercise,
    handleAddExercises
  };
};
