import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useExercises } from "@/hooks/useExercises";
import { ExerciseItem } from "../types";
import { useToast } from "@/hooks/use-toast";

// Define state types for sessionStorage
interface SelectExercisesState {
  selectedExercises: number[];
  searchTerm: string;
  muscleFilters: string[];
  equipmentFilters: string[];
}

const SESSION_STORAGE_KEY = "selectExercisesState";

export const useExerciseSelection = () => {
  const { toast } = useToast();
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
      try {
        const parsedState = JSON.parse(savedState) as SelectExercisesState;
        // Reset selected exercises but keep other filters if needed
        setSelectedExercises([]);
        setSearchTerm(parsedState.searchTerm || "");
        setMuscleFilters(parsedState.muscleFilters || []);
        setEquipmentFilters(parsedState.equipmentFilters || []);
      } catch (error) {
        console.error("Error parsing session storage:", error);
      }
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

  // Debugging for exercises
  useEffect(() => {
    console.log("Exercises loaded:", exercises.length, exercises);
  }, [exercises]);

  // Filter exercises based on search term and selected filters
  const filteredExercises = exercises.filter(exercise => {
    // Debugging
    if (!exercise) return false;
    if (!exercise.name) {
      console.warn("Exercise without name found:", exercise);
      return false;
    }

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

  // Debugging for filtered exercises
  useEffect(() => {
    console.log("Filtered exercises:", filteredExercises.length, filteredExercises);
  }, [filteredExercises]);

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
    // Save current selection state before navigating
    const stateToSave: SelectExercisesState = {
      selectedExercises,
      searchTerm,
      muscleFilters,
      equipmentFilters
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
    
    // Navigate to the exercise details page
    navigate(`/workout/exercise-details/${id}`);
  };

  const handleNavigateBack = () => {
    // Reset selection-specific state but keep filters
    const resetState = {
      selectedExercises: [],
      searchTerm,
      muscleFilters,
      equipmentFilters
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resetState));
    navigate(getReturnPath());
  };

  const handleCreateExercise = () => {
    navigate("/workout/create-exercise");
  };

  const handleAddExercises = () => {
    // Get the selected exercise objects
    const selectedExerciseObjects = exercises.filter(exercise => 
      selectedExercises.includes(Number(exercise.id))
    );
    
    if (selectedExerciseObjects.length === 0) {
      toast({
        title: "Sin ejercicios seleccionados",
        description: "Por favor, selecciona al menos un ejercicio para añadir",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate back to the return path with the selected exercises
    navigate(getReturnPath(), { 
      state: { selectedExercises: selectedExerciseObjects } 
    });
    
    // Show success notification
    toast({
      title: "Ejercicios añadidos",
      description: `Se han añadido ${selectedExerciseObjects.length} ejercicios a la rutina`,
    });
    
    // Reset only selections, keep filters for next time
    const resetState = {
      selectedExercises: [],
      searchTerm,
      muscleFilters,
      equipmentFilters
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resetState));
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
