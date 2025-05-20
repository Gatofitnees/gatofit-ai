
import { useMemo } from "react";
import { Exercise } from "@/data/exercises/exerciseTypes";

export function useFilteredExercises(
  exercises: Exercise[],
  searchTerm: string,
  muscleFilters: string[],
  equipmentFilters: string[]
) {
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      // Search term filter (name or muscle group)
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (exercise.muscle_group_main?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      // Muscle filter - check if any of the selected muscle filters match any of the muscles in the exercise
      let matchesMuscle = true;
      if (muscleFilters.length > 0) {
        const exerciseMuscles = exercise.muscle_group_main ? exercise.muscle_group_main.split(" ").map(m => m.trim()) : [];
        matchesMuscle = muscleFilters.some(filter => 
          exerciseMuscles.some(muscle => muscle === filter)
        );
      }
      
      // Equipment filter - check if any of the selected equipment types match any of the equipment in the exercise
      let matchesEquipment = true;
      if (equipmentFilters.length > 0) {
        const exerciseEquipment = exercise.equipment_required ? exercise.equipment_required.split(" ").map(e => e.trim()) : [];
        matchesEquipment = equipmentFilters.some(filter => 
          exerciseEquipment.some(equipment => equipment === filter)
        );
      }
      
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [exercises, searchTerm, muscleFilters, equipmentFilters]);

  return filteredExercises;
}
