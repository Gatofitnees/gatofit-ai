import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useExercises } from "@/hooks/useExercises";
import { ExerciseItem } from "../types";

// Define state types for sessionStorage
interface SelectExercisesState {
  selectedExercises: number[];
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

  // Reset selection state when component mounts
  // But keep filter preferences
  useEffect(() => {
    // Reset selected exercises array when the component mounts
    setSelectedExercises([]);
    
    const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as SelectExercisesState;
        // Recuperar solo los filtros, no los ejercicios seleccionados
        setSearchTerm(parsedState.searchTerm || "");
        setMuscleFilters(parsedState.muscleFilters || []);
        setEquipmentFilters(parsedState.equipmentFilters || []);
      } catch (error) {
        console.error("Error parsing exercise selection state:", error);
      }
    }
  }, []);

  // Save filtering state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave: SelectExercisesState = {
      selectedExercises,
      searchTerm,
      muscleFilters,
      equipmentFilters
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [selectedExercises, searchTerm, muscleFilters, equipmentFilters]);

  // Filter exercises based on search term and selected filters
  const filteredExercises = exercises.filter(exercise => {
    // Search term filter (name or muscle group)
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    // Solo limpiamos los ejercicios seleccionados
    const currentState = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || "{}");
    const resetState = {
      ...currentState,
      selectedExercises: []
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
    
    // Clear selected exercises from session storage
    resetSessionStorage();
    
    // Navigate back to the return path with the selected exercises
    console.log("Añadiendo ejercicios y volviendo a:", getReturnPath());
    console.log("Ejercicios seleccionados:", exercisesWithSets.length);
    
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
