
import { useState, useMemo } from "react";
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
    return exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exercise.muscle_group_main.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMuscle = muscleFilters.length === 0 || 
                            muscleFilters.includes(exercise.muscle_group_main);
      
      const matchesEquipment = equipmentFilters.length === 0 || 
                              (exercise.equipment_required && equipmentFilters.includes(exercise.equipment_required));
      
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [exercises, searchTerm, muscleFilters, equipmentFilters]);

  const handleExerciseSelect = (id: number) => {
    if (selectedExercises.includes(id)) {
      setSelectedExercises(selectedExercises.filter(exId => exId !== id));
    } else {
      setSelectedExercises([...selectedExercises, id]);
    }
  };

  const handleMuscleFilterToggle = (muscle: string) => {
    if (muscleFilters.includes(muscle)) {
      setMuscleFilters(muscleFilters.filter(m => m !== muscle));
    } else {
      setMuscleFilters([...muscleFilters, muscle]);
    }
  };

  const handleEquipmentFilterToggle = (equipment: string) => {
    if (equipmentFilters.includes(equipment)) {
      setEquipmentFilters(equipmentFilters.filter(e => e !== equipment));
    } else {
      setEquipmentFilters([...equipmentFilters, equipment]);
    }
  };

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
