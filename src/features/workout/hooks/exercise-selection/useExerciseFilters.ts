
import { useMemo } from "react";
import { ExerciseSelectionFilters } from "./types";
import { ExerciseItem } from "../../types";

export const useExerciseFilters = (
  exercises: ExerciseItem[],
  filters: ExerciseSelectionFilters
) => {
  const { searchTerm, muscleFilters, equipmentFilters } = filters;

  const handleMuscleFilterToggle = (
    muscle: string, 
    setMuscleFilters: (value: string[]) => void
  ) => {
    setMuscleFilters(
      muscleFilters.includes(muscle)
        ? muscleFilters.filter(m => m !== muscle)
        : [...muscleFilters, muscle]
    );
  };

  const handleEquipmentFilterToggle = (
    equipment: string,
    setEquipmentFilters: (value: string[]) => void
  ) => {
    setEquipmentFilters(
      equipmentFilters.includes(equipment)
        ? equipmentFilters.filter(e => e !== equipment)
        : [...equipmentFilters, equipment]
    );
  };

  // Filter exercises based on search term and selected filters
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      // Search term filter (name or muscle group)
      const matchesSearch = 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exercise.muscle_group_main?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      // Muscle filter
      let matchesMuscle = true;
      if (muscleFilters.length > 0) {
        matchesMuscle = muscleFilters.some(filter => 
          exercise.muscle_group_main?.toLowerCase().includes(filter.toLowerCase())
        );
      }

      // Equipment filter
      let matchesEquipment = true;
      if (equipmentFilters.length > 0) {
        matchesEquipment = equipmentFilters.some(filter => 
          exercise.equipment_required?.toLowerCase().includes(filter.toLowerCase())
        );
      }

      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [exercises, searchTerm, muscleFilters, equipmentFilters]);

  return {
    filteredExercises,
    handleMuscleFilterToggle,
    handleEquipmentFilterToggle
  };
};
