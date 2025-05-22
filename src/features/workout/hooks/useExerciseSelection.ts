import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useExercises } from "@/hooks/useExercises";
import { ExerciseItem } from "../types";

// Define state types for sessionStorage
interface SelectExercisesState {
  searchTerm: string;
  muscleFilters: string[];
  equipmentFilters: string[];
}

const SESSION_STORAGE_KEY = "selectExercisesState";

export const useExerciseSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { exercises, loading, muscleGroups, equipmentTypes } = useExercises();

  // Obtener la ruta de retorno de la URL
  const getReturnPath = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo');
    return returnTo || '/workout/create';
  };

  // Initialize state from session storage or with defaults
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);

  // Load state from sessionStorage on component mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState) as SelectExercisesState;
      // Keep selected exercises empty (will be handled by location state)
      // but restore filters and search term
      setSearchTerm(parsedState.searchTerm || "");
      setMuscleFilters(parsedState.muscleFilters || []);
      setEquipmentFilters(parsedState.equipmentFilters || []);
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave: SelectExercisesState = {
      searchTerm,
      muscleFilters,
      equipmentFilters
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [searchTerm, muscleFilters, equipmentFilters]);

  // Filter exercises based on search term and selected filters
  const filteredExercises = exercises.filter(exercise => {
    // Search term filter (name or muscle group)
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exercise.muscle_group_main?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    // Muscle filter
    let matchesMuscle = true;
    if (muscleFilters.length > 0) {
      const exerciseMuscles = exercise.muscle_group_main ? exercise.muscle_group_main.split(" ").map(m => m.trim()) : [];
      matchesMuscle = muscleFilters.some(filter => 
        exerciseMuscles.some(muscle => muscle === filter)
      );
    }

    // Equipment filter
    let matchesEquipment = true;
    if (equipmentFilters.length > 0) {
      const exerciseEquipment = exercise.equipment_required ? exercise.equipment_required.split(" ").map(e => e.trim()) : [];
      matchesEquipment = equipmentFilters.some(filter => 
        exerciseEquipment.some(equipment => equipment === filter)
      );
    }

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

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

  const handleExerciseDetails = (id: number) => {
    // Navigate to the exercise details page
    navigate(`/workout/exercise-details/${id}`);
  };

  // Reset session storage and navigate back
  const resetSessionStorage = () => {
    const resetState = {
      searchTerm: "",
      muscleFilters: [],
      equipmentFilters: []
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resetState));
  };

  const handleNavigateBack = () => {
    resetSessionStorage();
    navigate(getReturnPath());
  };

  const handleCreateExercise = () => {
    navigate("/workout/create-exercise");
  };

  const handleAddExercises = () => {
    // Get the selected exercise objects
    const selectedExerciseObjects = exercises.filter(exercise => 
      selectedExercises.includes(exercise.id)
    );
    
    // Add default sets to each exercise
    const exercisesWithSets = selectedExerciseObjects.map(exercise => ({
      ...exercise,
      sets: [
        {
          reps_min: 8,
          reps_max: 12,
          rest_seconds: 60
        }
      ]
    }));
    
    // Clear all state from session storage before navigating
    resetSessionStorage();
    
    // Navigate back to the return path with the selected exercises
    console.log("Returning to:", getReturnPath(), "with", exercisesWithSets.length, "exercises");
    navigate(getReturnPath(), { 
      state: { selectedExercises: exercisesWithSets } 
    });
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
    setSearchTerm,
    handleExerciseSelect,
    handleMuscleFilterToggle,
    handleEquipmentFilterToggle,
    handleExerciseDetails,
    handleNavigateBack,
    handleCreateExercise,
    handleAddExercises
  };
};
