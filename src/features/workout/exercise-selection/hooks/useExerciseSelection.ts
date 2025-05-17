
import { useState, useMemo, useCallback } from "react";
import { Exercise } from "../types";

export const useExerciseSelection = (exercises: Exercise[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  const muscleGroups = ["Pecho", "Espalda", "Piernas", "Hombros", "Bíceps", "Tríceps", "Core", "Glúteos"];
  const equipmentTypes = ["Peso Corporal", "Mancuernas", "Barra", "Máquinas", "Banda Elástica", "TRX"];

  const filteredExercises = useMemo(() => {
    if (!exercises || exercises.length === 0) {
      return [];
    }
    
    return exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (exercise.muscle_group_main && exercise.muscle_group_main.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesMuscle = muscleFilters.length === 0 || 
                            (exercise.muscle_group_main && muscleFilters.includes(exercise.muscle_group_main));
      
      const matchesEquipment = equipmentFilters.length === 0 || 
                              (exercise.equipment_required && equipmentFilters.includes(exercise.equipment_required));
      
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [exercises, searchTerm, muscleFilters, equipmentFilters]);

  const handleExerciseSelect = useCallback((id: number) => {
    setSelectedExercises(prev => {
      if (prev.includes(id)) {
        return prev.filter(exId => exId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleMuscleFilterToggle = useCallback((muscle: string) => {
    setMuscleFilters(prev => {
      if (prev.includes(muscle)) {
        return prev.filter(m => m !== muscle);
      } else {
        return [...prev, muscle];
      }
    });
  }, []);

  const handleEquipmentFilterToggle = useCallback((equipment: string) => {
    setEquipmentFilters(prev => {
      if (prev.includes(equipment)) {
        return prev.filter(e => e !== equipment);
      } else {
        return [...prev, equipment];
      }
    });
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    selectedExercises,
    setSelectedExercises,
    filteredExercises,
    muscleFilters,
    equipmentFilters,
    muscleGroups,
    equipmentTypes,
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    handleExerciseSelect,
    handleMuscleFilterToggle,
    handleEquipmentFilterToggle
  };
};
