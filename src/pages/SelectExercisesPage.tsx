
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import Button from "@/components/Button";
import { useExercises } from "@/hooks/useExercises";
import ExerciseSearch from "@/components/exercise/ExerciseSearch";
import ExerciseFilters from "@/components/exercise/ExerciseFilters";
import ExerciseList from "@/components/exercise/ExerciseList";

// Define state types for sessionStorage
interface SelectExercisesState {
  selectedExercises: number[];
  searchTerm: string;
  muscleFilters: string[];
  equipmentFilters: string[];
}

const SESSION_STORAGE_KEY = "selectExercisesState";

const SelectExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { exercises, loading, muscleGroups, equipmentTypes } = useExercises();
  
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
      setSelectedExercises(parsedState.selectedExercises || []);
      setSearchTerm(parsedState.searchTerm || "");
      setMuscleFilters(parsedState.muscleFilters || []);
      setEquipmentFilters(parsedState.equipmentFilters || []);
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

  // Filter exercises based on search term and selected filters with improved multi-value handling
  const filteredExercises = exercises.filter(exercise => {
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

  const handleAddExercises = () => {
    // Get the selected exercise objects
    const selectedExerciseObjects = exercises.filter(exercise => 
      selectedExercises.includes(exercise.id)
    );
    
    // Navigate back to create routine with the selected exercises
    navigate("/workout/create", { 
      state: { selectedExercises: selectedExerciseObjects } 
    });
  };

  const handleCreateExercise = () => {
    navigate("/workout/create-exercise");
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate("/workout/create")}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Seleccionar Ejercicios</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <ExerciseSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <ExerciseFilters 
            muscleGroups={muscleGroups}
            equipmentTypes={equipmentTypes}
            muscleFilters={muscleFilters}
            equipmentFilters={equipmentFilters}
            onMuscleFilterToggle={handleMuscleFilterToggle}
            onEquipmentFilterToggle={handleEquipmentFilterToggle}
          />
        </div>
      </div>

      {/* Exercise List */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {filteredExercises.length} ejercicios encontrados
          </span>
          <Button 
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleCreateExercise}
          >
            Crear Ejercicio
          </Button>
        </div>

        <ExerciseList 
          exercises={filteredExercises}
          selectedExercises={selectedExercises}
          onSelectExercise={handleExerciseSelect}
          onViewDetails={handleExerciseDetails}
          loading={loading}
        />
      </div>

      {/* Selected Exercises Floating Button */}
      {selectedExercises.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
          <Button
            variant="primary"
            className="shadow-neu-float px-6 bg-blue-500 hover:bg-blue-600"
            onClick={handleAddExercises}
          >
            Añadir {selectedExercises.length} ejercicios
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectExercisesPage;
